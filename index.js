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
  return new Promise(
    (resolve, reject) => {
      let directory = path.join(cwd, `./${projectName}`);
      let directoryExists = fs.existsSync(directory);
      if (directoryExists) {
        inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: `${directory} already exists. Please specify a new name. If you keep the current name, it will be deleted.`,
            default: `${projectName}`,
            filter: (val) => {
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
                return reject(`We've had problems removing the ${directory}. Do you have enough permissions to delete it?`);
              }
              ui.log.write(`! Deleted ${directory}`);
              return resolve(projectName);
            })
          } else {
            return resolve(directoryAnswers.projectName);
          }
        });
      } else {
        return resolve(projectName);
      }
    }
  );
}

function cloneRepo(url, projectName) {
  return new Promise(resolve => {
    // Assumption: Any source repos will have a template branch that we can use
    ui.log.write(`. Cloning ${url} to ./${projectName}\n`);
    const clone = spawn('git', [`clone`, `-b`, `template`, url, projectName]);
    clone.on('data', data => {
      ui.updateBottomBar(data);
    });

    clone.on('close', code => {
      ui.log.write(`. Finished cloning ${url} to ./${projectName}\n`);
      resolve();
    });

    clone.on('error', error => {
      throw error;
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

function readTemplateJson(projectName) {
  const pathToTemplateJson = path.join(cwd, `./${projectName}/template.json`);
  ui.log.write(`. Reading ${pathToTemplateJson}...\n`);
  return require(pathToTemplateJson);
}

function deleteTemplateJson(projectName) {
  const pathToTemplateJson = path.join(cwd, `./${projectName}/template.json`);
  fs.unlinkSync(pathToTemplateJson); // Bye felicia
}

function isValidFile(file, validFiles) {
  return Object.keys(validFiles)
    .some(filePattern => {
      return minimatch(file, filePattern);
    });
}

function isIgnoredFile(file, ignoredFiles) {
  return Object.keys(ignoredFiles)
    .some(filePattern => {
      return minimatch(file, filePattern);
    });
}

function templateReplace(answers, templateJson) {
  const pathToProject = path.join(cwd, `./${answers.projectName}`);
  let validFiles = templateJson.valid_files || {};
  let ignoreFiles = templateJson.ignore_files || {};
  let files = walkSync(pathToProject);
  files.forEach(file => {
    if (
      (isValidFile(file.path, validFiles)) && !isIgnoredFile(file.path, ignoreFiles)
    ) {
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
      return `${answerKey}=${answers[answerKey]}\n`
    })
    .reduce((previous, current) => {
      return previous.concat(current);
    }, '');
    
  fs.writeFileSync(pathToEnvFile, contents, { encoding: 'utf8' });
  ui.log.write(`. Wrote ${pathToEnvFile} successfully`);
}

async function run() {
  try {
    let answers = await inquirer.prompt(initialQuestions);
    answers.projectName = await checkForExistingFolder(answers.projectName);
    await cloneRepo(answers.gitRepoURL, answers.projectName);
    await deleteGitFolder(answers.projectName);
    let templateJson = readTemplateJson(answers.projectName);
    let templateAnswers = await inquirer.prompt(
      templateJson.questions
    );
    templateReplace(
      Object.assign(
        { ...answers, ...templateAnswers },
        { projectNameDocker: answers.projectName.replace(/-/g, '_') }
      ), templateJson
    );

    if (templateJson['.env']) {
      let envAnswers = await inquirer.prompt(templateJson['.env']);
      createEnvFile(answers.projectName, envAnswers);
    }

    deleteTemplateJson(answers.projectName);
  } catch (error) {
    console.error(error);
  }
}

run();
