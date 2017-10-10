#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const inquirer = require('inquirer');
const initialQuestions = require('./initialQuestions');
const templateQuestions = require('./templateQuestions');

function cloneRepo(url, projectName) {
  return new Promise(
    resolve => {
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
        throw (error);
      })
    }
  );
}

function deleteGitFolder(projectName) {
  return new Promise(
    resolve => {
      const cwd = path.resolve(process.cwd());
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
    }
  );
}

async function run() {
  try {
    let answers = await inquirer.prompt(initialQuestions);
    await cloneRepo(answers.gitRepoURL, answers.projectName);

    // TODO: Delete .git folder in cloned directory
    await deleteGitFolder(answers.projectName);

    // TODO: Read the template.json in the cloned directory
    // TODO: Template swap files in cloned directory
  } catch (error) {
    console.error(error);
  }
}


run();