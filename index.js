#!/usr/bin/env node
const inquirer = require('inquirer');
const args = require('yargs').argv;
const baseIngredients = require('./ingredients');
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
  readProjectRecipe,
  bakeProject
} = require('./tasks/project');

const { bakeRecipe } = require('./tasks/recipes');

const ui = new inquirer.ui.BottomBar();

// Only watch for <%= %> swaps, lodash template swaps ES6 templates by default
_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

function invalidGitRepo(error) {
  throw new Error(
    `! This is not a valid ads-baseline. Please see the conventions here: https://github.com/appirio-digital/ads-baseline/blob/master/CONVENTIONS.md\n  ! ${error.message}`
  );
}

async function bake() {
  try {
    // Mise en place
    let projectIngredients = await inquirer.prompt(baseIngredients);
    projectIngredients.projectName = await checkForExistingFolder(ui, projectIngredients.projectName);

    // Check if the repo is valid
    await cloneRepo(ui, projectIngredients.gitRepoURL, projectIngredients.projectName).catch(
      invalidGitRepo
    );
    let recipe = readProjectRecipe(ui, projectIngredients.projectName);

    // Remove git bindings
    await deleteGitFolder(ui, projectIngredients.projectName);

    // Ask away!
    let ingredients = await inquirer.prompt(recipe.ingredients);
    bakeProject(
      ui,
      Object.assign(
        { ...projectIngredients, ...ingredients },
        { projectNameDocker: projectIngredients.projectName.replace(/-/g, '_') }
      ),
      recipe
    );

    // .env file setup
    if (recipe.env) {
      let envAnswers = await inquirer.prompt(recipe.env);
      createEnvFile(ui, projectIngredients.projectName, envAnswers);
    }

    // Finally, establish a local .git binding
    // And optionally push to a specified remote repo
    await establishLocalGitBindings(ui, projectIngredients.projectName);
    if (projectIngredients.gitOriginURL) {
      await pushLocalGitToOrigin(ui, projectIngredients.gitOriginURL, projectIngredients.projectName);
    }
  } catch (error) {
    ui.log.write(error.message);
  }
}

if (args.start) {
  bake();
} else {
  if (args.recipe) {
    bakeRecipe(ui, args.recipe)
  }
}
