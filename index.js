#!/usr/bin/env node
const inquirer = require('inquirer');
const _ = require('lodash');
const yargs = require('yargs');

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
  plug,
  unplug,
  sync,
  readAndInitializeProjectRecipe,
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

async function bake(args = {}) {
  try {
    let baseIngredients = require('./ingredients');

    // Mise en place
    baseIngredients = baseIngredients
      .filter(ingredient => {
        if (args[ingredient.name]) {
          console.log(`> ${ingredient.name}: ${args[ingredient.name]}`);
          return false;
        }
        return true;
      });
    
    let projectIngredients = await inquirer.prompt(baseIngredients);
    projectIngredients = Object.assign(projectIngredients, args);
    projectIngredients.projectName = await checkForExistingFolder(ui, projectIngredients.projectName);

    // Check if the repo is valid
    await cloneRepo(ui, projectIngredients.gitRepoURL, projectIngredients.projectName).catch(
      invalidGitRepo
    );
    let recipe = readAndInitializeProjectRecipe(ui, projectIngredients.projectName, projectIngredients.gitRepoURL);

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

function sanitizeArgs(argv) {
  // Remove any yargs-specific keys to avoid false positives
  let args = { ...argv };
  delete args._;
  delete args.help;
  delete args.version;
  delete args['$0'];
  return args;
}

console.log(require('./logo'));

// TODO: Refactor as command folders
// Understood commands
const args = yargs
  .command('plug', 'ezbake-ifies a project', () => {}, async (argv) => {
    await plug(ui);
    process.exit(0);
  })
  .command('unplug', 'removes ezbake from a project', () => {}, (argv) => {
    unplug(ui);
    process.exit(0);
  })
  .command('prepare', 'creates a new scaffold from an ezbake project in a specified Git source', (yargs) => {
    return yargs
      .option('r', {
        alias: 'gitRepoURL',
        describe: 'The URL of the source Git repo to ezbake'
      })
      .option('o', {
        alias: 'gitOriginURL',
        describe: 'The URL of the Git destination repo to push to as a remote origin'
      });
  }, async (argv) => {
    let args = sanitizeArgs(argv);
    await bake(args);
    process.exit(0);
  })
  .command('sync', 'synchronizes the .ezbake folder from the source project', (yargs) => {
    return yargs
      .option('r', {
        alias: 'gitRepoURL',
        describe: '(Optional) The URL of the source ezbake project Git repo. Leaving this blank will simply read from .ezbake/.gitsource, which was established after ezbake prepare'
      });
  }, async (argv) => {
    let args = sanitizeArgs(argv);
    await sync(ui, args).catch(error => { 
      ui.log.write(error.message);
      process.exit(1);
    });
    process.exit(0);
  })
  .command('cook', 'for use in an exisiting ezbake project, cooks a recipe that has been defined by the author', (yargs) => {
    return yargs.option('r', {
      alias: 'recipe',
      describe: '(Required) The URL of the Git repo to ezbake'
    })
  }, async (argv) => {
    let args = sanitizeArgs(argv);
    if (!args.recipe) {
      console.log(`! You must specify a recipe to cook`);
      process.exit(1);
    }
    await bakeRecipe(ui, args.recipe);
    process.exit(0);
  })
  .command('*', 'the default command', () => {}, (argv) => {
    console.log('! Welcome to ezbake');
    console.log(`? Please type ezbake --help for information.`)
    process.exit(0);
  })
  .help()
  .argv;

