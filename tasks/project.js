const fs = require('fs-extra');
const minimatch = require('minimatch');
const path = require('path');
const _ = require('lodash');
const rimraf = require('rimraf');
const cwd = path.resolve(process.cwd());
const { walkSync } = require('./filesystem');
const { spawn, exec } = require('child_process');

module.exports = {
  plug,
  unplug,
  readProjectRecipe,
  bakeProject
};

function plug(ui) {
  return new Promise(
    (resolve, reject) => {
      ui.log.write(`. Plugging in ezbake to ${cwd}...`);
      let pathToEzBake = path.join(cwd, './.ezbake');
      let pathToBaseConfigs = path.join(__dirname, '../.ezbake');
      if (!fs.existsSync(pathToEzBake)) {
        fs.mkdirSync(pathToEzBake);
      }

      fs.copy(pathToBaseConfigs, pathToEzBake, (err) => {
        if (err) {
          return reject(new Error(`! Could not copy ${pathToBaseConfigs} to ${pathToEzBake}. Please check your permissions and try again.`));
        }
        ui.log.write(`. Successfully plugged in ezbake to ${cwd}...`);
        return resolve();
      });
    }
  );  
}

function unplug(ui) {
  ui.log.write(`. Unplugging ezbake from ${cwd}...`);
  let pathToEzBake = path.join(cwd, './.ezbake');
  rimraf.sync(pathToEzBake);
  ui.log.write(`. Successfully unplugged ezbake from ${cwd}...`);
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

function readProjectRecipe(ui, projectName) {
  const pathToRecipe = path.join(cwd, `./${projectName}/.ezbake`);
  ui.log.write(`. Reading ${pathToRecipe}...\n`);
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
