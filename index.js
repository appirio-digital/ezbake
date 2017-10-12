#!/usr/bin/env node
const inquirer = require('inquirer');
const initialQuestions = require('./initialQuestions');
const _ = require('lodash');

const {
  cloneRepo,
  deleteGitFolder,
  establishLocalGitBindings,
  pushLocalGitToOrigin
} = require('./tasks/git');

const {
  createEnvFile,
  walkSync,
  checkForExistingFolder,
  isValidFile
} = require('./tasks/filesystem');

const {
  readTemplateJs,
  deleteTemplateJs,
  templateReplace
} = require('./tasks/template');

const ui = new inquirer.ui.BottomBar();

// Only watch for <%= %> swaps, lodash template swaps ES6 templates by default
_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

function invalidGitRepo(error) {
  throw new Error(
    `! This is not a valid ads-baseline. Please see the conventions here: https://github.com/appirio-digital/ads-baseline/blob/master/CONVENTIONS.md\n  ! ${error.message}`
  );
}

async function run() {
  try {
    // Initial setup
    let answers = await inquirer.prompt(initialQuestions);
    answers.projectName = await checkForExistingFolder(ui, answers.projectName);

    // Check if the repo is valid
    await cloneRepo(ui, answers.gitRepoURL, answers.projectName).catch(
      invalidGitRepo
    );
    let templateJs = readTemplateJs(ui, answers.projectName);

    // Remove git bindings
    await deleteGitFolder(ui, answers.projectName);

    // Ask away!
    let templateAnswers = await inquirer.prompt(templateJs.questions);
    templateReplace(
      ui,
      Object.assign(
        { ...answers, ...templateAnswers },
        { projectNameDocker: answers.projectName.replace(/-/g, '_') }
      ),
      templateJs
    );

    // .env file setup
    if (templateJs.env) {
      let envAnswers = await inquirer.prompt(templateJs.env);
      createEnvFile(ui, answers.projectName, envAnswers);
    }

    // Remove .template.js
    deleteTemplateJs(ui, answers.projectName);

    // Finally, establish a local .git binding
    // And optionally push to a specified remote repo
    await establishLocalGitBindings(ui, answers.projectName);
    if (answers.gitOriginURL) {
      await pushLocalGitToOrigin(ui, answers.gitOriginURL, answers.projectName);
    }
  } catch (error) {
    ui.log.write(error.message);
  }
}

run();
