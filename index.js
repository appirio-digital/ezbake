#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const initialQuestions = require('./initialQuestions');
const cwd = path.resolve(process.cwd());

// Escape hatches below for exception files
const validFiles = { Dockerfile: true };
const validExtensions = {
  '.js': true,
  '.json': true,
  '.yml': true,
  '.sh': true
};
const ignoreFiles = { 'launch.json': true };
const _ = require('lodash');

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

function cloneRepo(url, projectName) {
  return new Promise(resolve => {
    // Assumption: Any source repos will have a template branch that we can use
    console.log(`Cloning ${url} to ./${projectName}`);
    const clone = spawn('git', [`clone`, `-b`, `template`, url, projectName]);
    clone.on('data', data => {
      console.log(data);
    });

    clone.on('close', code => {
      console.log(`Finished cloning ${url} to ./${projectName}`);
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
    console.log(`Removing .git folder from ${pathToGit}`);
    const del = spawn('rm', ['-rf', pathToGit]);
    del.on('data', data => {
      console.log(data);
    });

    del.on('close', code => {
      console.log(`Finished deleting .git folder`);
      resolve();
    });
  });
}

function readTemplateJson(projectName) {
  const pathToTemplateJson = path.join(cwd, `./${projectName}/template.json`);
  console.log(`Reading ${pathToTemplateJson}...`);
  return require(pathToTemplateJson);
}

function deleteTemplateJson(projectName) {
  const pathToTemplateJson = path.join(cwd, `./${projectName}/template.json`);
  fs.unlinkSync(pathToTemplateJson); // Bye felicia
}

function templateReplace(answers) {
  const pathToProject = path.join(cwd, `./${answers.projectName}`);
  let files = walkSync(pathToProject);
  files.forEach(file => {
    let extension = path.extname(file.name);
    if (
      (validExtensions[extension] || validFiles[file.name]) &&
      !ignoreFiles[file.name]
    ) {
      console.log(`Swapping template values for ${file.path}...`);
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
}

async function run() {
  try {
    let answers = await inquirer.prompt(initialQuestions);
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
      )
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
