const path = require('path');
const inquirer = require('inquirer');
const yargs = require('yargs');
const {
  sanitizeArgs,
  ui,
  invalidGitRepo,
  ingredients,
  addIngredients,
  promiseTimeout
} = require('../common');

const {
  cloneRepo,
  deleteGitFolder,
  establishLocalGitBindings,
  addGitRemote,
  pushLocalGitToOrigin,
  stageChanges
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

const getDefaultProjectName = repoURL => {
  let projectName = path.basename(repoURL).toLowerCase();
  projectName = projectName.replace(/\.git$/, '');
  projectName = projectName.replace(/\.+/g, '-');
  projectName = projectName.replace(/-+/g, '-');
  return projectName;
};

const getValidProjectName = name => {
  return name
    .replace(/\W+/g, ' ') // alphanumerics only
    .trimRight()
    .replace(/ /g, '-')
    .toLowerCase();
};

module.exports = {
  command: 'prepare',
  desc:
    'creates a new scaffold from an ezbake project in a specified Git source',
  builder: yargs => {
    return yargs
      .option('n', {
        alias: 'projectName',
        describe: 'Alphanumeric project name'
      })
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
      })
      .option('s', {
        alias: 'simple',
        describe:
          'Flag to indicate Whether to ask for authorName, authorEmail and projectDescription',
        type: 'boolean',
        default: false
      });
  },
  handler: async argv => {
    // console.log(argv);
    let args = sanitizeArgs(argv);
    // Sanitize Project Name, if passed in as parameter
    if (args['projectName']) {
      args['projectName'] = getValidProjectName(args['projectName']);
    }
    let baseIngredients = ingredients;
    const TIMEOUT = 20000;
    try {
      // Mise en place
      baseIngredients = baseIngredients.filter(ingredient => {
        if (ingredient.name === 'projectName') {
          // Override default project name
          if (!args[ingredient.name] && args['gitOriginURL']) {
            ingredient.default = getDefaultProjectName(args['gitOriginURL']);
          }
        }
        // Exclude fields for which the values have already been provided with the command
        if (args[ingredient.name]) {
          console.log(`> ${ingredient.name}: ${args[ingredient.name]}`);
          return false;
        }
        // Exclude some fields in case of simple setup
        if (
          args['simple'] &&
          ['authorName', 'authorEmail', 'projectDescription'].includes(
            ingredient.name
          )
        ) {
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
      await promiseTimeout(
        TIMEOUT,
        deleteGitFolder(ui, projectIngredients.projectName)
      ).catch(err => {
        throw new Error(`Error: ${err} while deleting cloned Git folder.`);
      });

      // Ask away!
      let ingredients = await inquirer.prompt(recipe.ingredients);
      let allIngredients = Object.assign(
        {
          ...projectIngredients,
          ...ingredients
        },
        {
          projectNameDocker: projectIngredients.projectName.replace(/-/g, '_'),
          projectAuthor:
            projectIngredients.authorName +
            ' <' +
            projectIngredients.authorEmail +
            '>'
        }
      );

      bakeProject(ui, allIngredients, recipe);

      // .env file setup
      if (recipe.env) {
        let envAnswers = await inquirer.prompt(recipe.env);
        createEnvFile(ui, projectIngredients.projectName, envAnswers);
      }

      // Finally, establish a local .git binding
      // And optionally add the specified remote

      await promiseTimeout(
        TIMEOUT,
        establishLocalGitBindings(ui, projectIngredients.projectName)
      ).catch(err => {
        throw new Error(`Error: ${err} while establishing Git bindings.`);
      });
      if (projectIngredients.gitOriginURL) {
        await addGitRemote(
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
              addIngredients(icing.cmd, allIngredients),
              icing.cmdOptions
            );
          }
        }
        ui.log.write(`. Icing applied!`);
      }

      // Finally, stage and commit the changes.
      // And optionally push to a remote repo
      await stageChanges(
        ui,
        '[ezbake] - initial commit',
        projectIngredients.projectName
      );
      if (projectIngredients.gitOriginURL) {
        await pushLocalGitToOrigin(
          ui,
          projectIngredients.gitOriginURL,
          projectIngredients.projectName
        );
      }

      ui.log.write(`. Your project is ready!`);
      process.exit(0);
    } catch (error) {
      ui.log.write(error.message);
      process.exit(-1);
    }
  }
};
