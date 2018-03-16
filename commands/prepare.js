const path = require('path');
const inquirer = require('inquirer');
const yargs = require('yargs');
const {
  sanitizeArgs,
  ui,
  invalidGitRepo,
  ingredients,
  addIngredients
} = require('../common');

const {
  cloneRepo,
  deleteGitFolder,
  establishLocalGitBindings,
  pushLocalGitToOrigin
} = require('../tasks/git');

const {
  createEnvFile,
  checkForExistingFolder,
  executeCommand
} = require('../tasks/filesystem');

const {
  readAndInitializeProjectRecipe,
  bakeProject
} = require('../tasks/project');

module.exports = {
  command: 'prepare',
  desc:
    'creates a new scaffold from an ezbake project in a specified Git source',
  builder: yargs => {
    return yargs
      .option('r', {
        alias: 'gitRepoURL',
        describe: 'The URL of the source Git repo to ezbake'
      })
      .option('b', {
        alias: 'gitRepoBranch',
        describe:
          'The branch on the source repo which contains the .ezbake folder'
      })
      .option('o', {
        alias: 'gitOriginURL',
        describe:
          'The URL of the Git destination repo to push to as a remote origin'
      });
  },
  handler: async argv => {
    let args = sanitizeArgs(argv);
    let baseIngredients = ingredients;
    try {
      // Mise en place
      baseIngredients = baseIngredients.filter(ingredient => {
        if (args[ingredient.name]) {
          console.log(`> ${ingredient.name}: ${args[ingredient.name]}`);
          return false;
        }
        return true;
      });

      let projectIngredients = await inquirer.prompt(baseIngredients);
      projectIngredients = Object.assign(projectIngredients, args);
      projectIngredients.projectName = await checkForExistingFolder(
        ui,
        projectIngredients.projectName
      );

      // Check if the repo is valid
      await cloneRepo(
        ui,
        projectIngredients.gitRepoURL,
        projectIngredients.gitRepoBranch,
        projectIngredients.projectName
      ).catch(invalidGitRepo);
      let recipe = readAndInitializeProjectRecipe(
        ui,
        projectIngredients.projectName,
        projectIngredients.gitRepoURL,
        projectIngredients.gitRepoBranch
      );

      // Remove git bindings
      await deleteGitFolder(ui, projectIngredients.projectName);

      // Ask away!
      let ingredients = await inquirer.prompt(recipe.ingredients);
      let consolatedIngredients = Object.assign(
        {
          ...projectIngredients,
          ...ingredients
        },
        {
          projectNameDocker: projectIngredients.projectName.replace(/-/g, '_')
        }
      );

      bakeProject(ui, consolatedIngredients, recipe);

      // .env file setup
      if (recipe.env) {
        let envAnswers = await inquirer.prompt(recipe.env);
        createEnvFile(ui, projectIngredients.projectName, envAnswers);
      }

      // Finally, establish a local .git binding
      // And optionally push to a specified remote repo
      await establishLocalGitBindings(ui, projectIngredients.projectName);
      if (projectIngredients.gitOriginURL) {
        await pushLocalGitToOrigin(
          ui,
          projectIngredients.gitOriginURL,
          projectIngredients.projectName
        );
      }

      if (recipe.icing && Array.isArray(recipe.icing)) {
        ui.log.write(`. Applying icing...`);
        let projectDir = path.join(
          process.cwd(),
          `./${projectIngredients.projectName}`
        );
        process.chdir(projectDir);

        for (let icing of recipe.icing) {
          ui.log.write(`  . ${icing.description}`);
          if (Array.isArray(icing.cmd)) {
            await executeCommand(
              addIngredients(icing.cmd, consolatedIngredients),
              icing.cmdOptions
            );
          }
        }
        ui.log.write(`. Icing applied!`);
      }

      ui.log.write(`. Your project is ready!`);
      process.exit(0);
    } catch (error) {
      ui.log.write(error.message);
      process.exit(-1);
    }
  }
};
