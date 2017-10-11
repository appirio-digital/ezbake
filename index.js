#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const initialQuestions = require('./initialQuestions');
const cwd = path.resolve(process.cwd());
const _ = require('lodash');
const minimatch = require('minimatch');
const ui = new inquirer.ui.BottomBar();

// Only watch for <%= %> swaps, lodash template swaps ES6 templates by default
_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

function walkSync(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      filelist.push({ path: path.join(dir, file), name: file });
    }
  });
  return filelist;
}

async function checkForExistingFolder(projectName) {
  return new Promise((resolve, reject) => {
    let directory = path.join(cwd, `./${projectName}`);
    let directoryExists = fs.existsSync(directory);
    if (directoryExists) {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'projectName',
            message: `${directory} already exists. Please specify a new name. If you keep the current name, it will be deleted.`,
            default: `${projectName}`,
            filter: val => {
              return val
                .replace(/\W+/g, ' ') // alphanumerics only
                .trimRight()
                .replace(/ /g, '-')
                .toLowerCase();
            }
          }
        ])
        .then(directoryAnswers => {
          if (directoryAnswers.projectName === projectName) {
            const rm = spawn('rm', [`-rf`, directory]);
            rm.on('close', code => {
              if (code !== 0) {
                return reject(
                  `We've had problems removing the ${directory}. Do you have enough permissions to delete it?`
                );
              }
              ui.log.write(`! Deleted ${directory}`);
              return resolve(projectName);
            });
          } else {
            return resolve(directoryAnswers.projectName);
          }
        });
    } else {
      return resolve(projectName);
    }
  });
}

function cloneRepo(url, projectName) {
  return new Promise((resolve, reject) => {
    // Assumption: Any source repos will have a template branch that we can use
    ui.log.write(`. Cloning ${url} to ./${projectName}\n`);
    const clone = spawn('git', [`clone`, `-b`, `template`, url, projectName]);
    clone.on('data', data => {
      ui.updateBottomBar(data);
    });

    clone.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Could not clone repository properly. Please check for the existence of a template branch or your permissions to that Git repo.`));
      }
      ui.log.write(`. Finished cloning ${url} to ./${projectName}\n`);
      return resolve();
    });

    clone.on('error', error => {
      reject(error);
    });
  });
}

function deleteGitFolder(projectName) {
  return new Promise(resolve => {
    const pathToGit = path.join(cwd, `./${projectName}/.git`);
    ui.log.write(`. Removing .git folder from ${pathToGit}\n`);
    const del = spawn('rm', ['-rf', pathToGit]);
    del.on('data', data => {
      ui.updateBottomBar(data);
    });

    del.on('close', code => {
      ui.updateBottomBar(`. Finished deleting .git folder\n`);
      resolve();
    });
  });
}

function readTemplateJs(projectName) {
  const pathToTemplateJson = path.join(cwd, `./${projectName}/.template.js`);
  ui.log.write(`. Reading ${pathToTemplateJson}...\n`);
  return require(pathToTemplateJson);
}

function deleteTemplateJs(projectName) {
  const pathToTemplateJson = path.join(cwd, `./${projectName}/.template.js`);
  fs.unlinkSync(pathToTemplateJson); // Bye felicia
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

function templateReplace(answers, templateJson) {
  const pathToProject = path.join(cwd, `./${answers.projectName}`);
  let fileGlobs = templateJson.files || {};
  let files = walkSync(pathToProject);
  files.forEach(file => {
    if (isValidFile(file.path, fileGlobs)) {
      ui.log.write(`. Swapping template values for ${file.path}...\n`);
      let fileTemplate = _.template(fs.readFileSync(file.path));
      fs.writeFileSync(file.path, fileTemplate(answers), { encoding: 'utf8' });
    }
  });
}

function createEnvFile(projectName, answers) {
  const pathToEnvFile = path.join(cwd, `./${projectName}/.env`);
  let contents = Object.keys(answers)
    .map(answerKey => {
      return `${answerKey}=${answers[answerKey]}\n`;
    })
    .reduce((previous, current) => {
      return previous.concat(current);
    }, '');

  fs.writeFileSync(pathToEnvFile, contents, { encoding: 'utf8' });
  ui.log.write(`. Wrote ${pathToEnvFile} successfully`);
}

function invalidGitRepo(error) {
  throw new Error(`! This is not a valid ads-baseline. Please see the conventions here: https://github.com/appirio-digital/ads-baseline/blob/master/CONVENTIONS.md\n  ! ${error.message}`);
}

async function run() {
  try {
    // Initial setup
    let answers = await inquirer.prompt(initialQuestions);
    answers.projectName = await checkForExistingFolder(answers.projectName);

    // Check if the repo is valid
    await cloneRepo(answers.gitRepoURL, answers.projectName)
      .catch(invalidGitRepo);
    let templateJs = readTemplateJs(answers.projectName);

    // Remove git bindings
    await deleteGitFolder(answers.projectName);

    // Ask away!
    let templateAnswers = await inquirer.prompt(templateJs.questions);
    templateReplace(
      Object.assign(
        { ...answers, ...templateAnswers },
        { projectNameDocker: answers.projectName.replace(/-/g, '_') }
      ),
      templateJs
    );

    // .env file setup
    if (templateJs.env) {
      let envAnswers = await inquirer.prompt(templateJs.env);
      createEnvFile(answers.projectName, envAnswers);
    }

    // Remove .template.js
    deleteTemplateJs(answers.projectName);
  } catch (error) {
    ui.log.write(error.message);
  }
}

run();
