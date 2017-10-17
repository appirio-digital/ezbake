const fs = require('fs-extra');
const minimatch = require('minimatch');
const path = require('path');
const _ = require('lodash');
const rimraf = require('rimraf');
const cwd = path.resolve(process.cwd());
const { walkSync } = require('./filesystem');
const { cloneRepo } = require('./git');
const { spawn, exec } = require('child_process');

module.exports = {
  plug,
  unplug,
  sync,
  readAndInitializeProjectRecipe,
  bakeProject
};

function plug(ui) {
  return new Promise((resolve, reject) => {
    ui.log.write(`. Plugging in ezbake to ${cwd}...`);
    let pathToEzBake = path.join(cwd, './.ezbake');
    let pathToBaseConfigs = path.join(__dirname, '../.ezbake');
    if (!fs.existsSync(pathToEzBake)) {
      fs.mkdirSync(pathToEzBake);
    }

    fs.copy(pathToBaseConfigs, pathToEzBake, err => {
      if (err) {
        return reject(
          new Error(
            `! Could not copy ${pathToBaseConfigs} to ${pathToEzBake}. Please check your permissions and try again.`
          )
        );
      }
      ui.log.write(`. Successfully plugged in ezbake to ${cwd}...`);
      return resolve();
    });
  });
}

function unplug(ui) {
  ui.log.write(`. Unplugging ezbake from ${cwd}...`);
  let pathToEzBake = path.join(cwd, './.ezbake');
  rimraf.sync(pathToEzBake);
  ui.log.write(`. Successfully unplugged ezbake from ${cwd}...`);
}

function sync(ui, args = {}) {
  return new Promise(async (resolve, reject) => {
    const pathToEzBake = path.join(cwd, './.ezbake');
    const pathToGitSource = path.join(cwd, './.ezbake/.gitsource');

    const uuidv1 = require('uuid/v1');
    let tempFolderName = uuidv1();
    if (!args.gitRepoURL && !fs.existsSync(pathToGitSource)) {
      return reject(
        new Error(`! No Git URL specified and ${pathToGitSource} not found.`)
      );
    }

    args.gitRepoBranch = args.gitRepoBranch || 'ezbake';
    if (!args.gitRepoURL) {
      let repoFull = fs
        .readFileSync(pathToGitSource, { encoding: 'utf8' })
        .toString();
      let repoParts = repoFull.split('#');
      args.gitRepoURL = repoParts[0];
      args.gitRepoBranch = repoParts[1];
    } else {
      ui.log.write(`> Manual override, cloning from ${args.gitRepoURL}`);
    }

    await cloneRepo(
      ui,
      args.gitRepoURL,
      `ezbake`,
      tempFolderName
    ).catch(error => {
      return reject(
        new Error(
          `! Could not clone source repo. Please try again. ${error.message}`
        )
      );
    });

    const pathToUpdatedEzBake = path.join(cwd, `/${tempFolderName}/.ezbake`);
    ui.log.write(
      `. Retrieved latest from ${args.gitRepoURL} to ${pathToUpdatedEzBake}`
    );
    rimraf.sync(pathToEzBake);
    fs.copy(pathToUpdatedEzBake, pathToEzBake, { overwrite: true }, err => {
      if (err) {
        return reject(
          new Error(
            `! Could not copy ${pathToUpdatedEzBake} to ${pathToEzBake}. Please check your permissions and try again.`
          )
        );
      }
      ui.log.write(
        `. Successfully synced in ezbake from ${pathToUpdatedEzBake}`
      );
      ui.log.write(`. Updating .gitsource to ${args.gitRepoURL}`);
      fs.writeFileSync(
        path.join(pathToEzBake, '/.gitsource'),
        `${args.gitRepoURL}#${args.gitRepoBranch}`,
        { encoding: 'utf-8' }
      );
      ui.log.write(`. Finished updating .gitsource to ${args.gitRepoURL}`);
      rimraf.sync(path.join(cwd, `/${tempFolderName}`));
      ui.log.write(`. Removed ${pathToUpdatedEzBake}`);
      return resolve();
    });
  });
}

function isValidFile(file, validFiles) {
  let fileMatches = Object.keys(validFiles).some(filePattern => {
    let fileMatch = minimatch(file, filePattern);
    return fileMatch && validFiles[filePattern];
  });

  let ignoreMatches = Object.keys(validFiles).some(filePattern => {
    let fileMatch = minimatch(file, filePattern);
    return fileMatch && validFiles[filePattern] === false;
  });

  return fileMatches && !ignoreMatches;
}

function readAndInitializeProjectRecipe(
  ui,
  projectName,
  gitRepoURL,
  gitRepoBranch
) {
  const pathToRecipe = path.join(cwd, `./${projectName}/.ezbake`);
  ui.log.write(`. Reading ${pathToRecipe}...\n`);

  // Create a .gitsource file with the original gitRepoURL specified for sync support
  ui.log.write(`. Writing .gitsource to .ezbake project`);
  fs.writeFileSync(
    path.join(pathToRecipe, '/.gitsource'),
    `${gitRepoURL}#${gitRepoBranch}`,
    { encoding: 'utf-8' }
  );
  ui.log.write(`. Finished writing .gitsource to .ezbake project`);
  return require(pathToRecipe);
}

function bakeProject(ui, answers, recipe) {
  const pathToProject = path.join(cwd, `./${answers.projectName}`);
  let fileGlobs = recipe.source || {};
  let files = walkSync(pathToProject);
  files.forEach(file => {
    if (isValidFile(file.path, fileGlobs)) {
      ui.log.write(`. Swapping template values for ${file.path}...\n`);
      let fileTemplate = _.template(fs.readFileSync(file.path));
      fs.writeFileSync(file.path, fileTemplate(answers), { encoding: 'utf8' });
    }
  });
}
