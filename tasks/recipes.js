const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const _ = require('lodash');
const cwd = path.resolve(process.cwd());
const ezbakeDir = path.join(cwd, './.ezbake');
const recipeDir = path.join(ezbakeDir, './recipes');
const { stageChanges } = require('./git');
const { addIngredients } = require('../common');
const { executeCommand } = require('./filesystem');
const {
  baseIngredients,
  newRecipeIngredients,
  recipeTemplate
} = require('../common/recipes');

module.exports = {
  menu,
  bakeRecipe,
  newRecipe
};

async function newRecipe(ui) {
  try {
    let ingredients = await inquirer.prompt(newRecipeIngredients);
    let newRecipePath = path.join(recipeDir, `./${ingredients.recipeName}.js`);
    let answers = {
      overwriteExistingFile: true
    };
    if (fs.existsSync(newRecipePath)) {
      answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwriteExistingFile',
          message: `${newRecipePath} exists. Would you like to continue and overwrite this file?`,
          default: true
        }
      ]);
    }

    if (answers.overwriteExistingFile) {
      ui.log.write(`. Writing new recipe ${newRecipePath}...`);
      fs.writeFileSync(newRecipePath, recipeTemplate, { encoding: 'utf-8' });
      ui.log.write(`. Successfully wrote ${newRecipePath}!`);
      process.exit(0);
    }
    process.exit(0);
  } catch (error) {
    ui.log.write(`! ${error.message}`);
    process.exit(-1);
  }
}

function menu(ui) {
  try {
    const recipes = fs.readdirSync(recipeDir).map(fileOrDirName => {
      let stats = fs.lstatSync(path.join(recipeDir, fileOrDirName));
      if (stats.isFile()) {
        return fileOrDirName.replace(/\.[^/.]+$/, '');
      }
      return fileOrDirName;
    });

    let output = recipes.forEach(recipe => {
      let recipeDefinition = require(path.join(recipeDir, recipe));
      ui.log.write(
        `> ${recipe}: ${recipeDefinition.description ||
          'Recipe definition for ' + recipe}`
      );
      ui.log.write(`  > Example: ezbake cook -r ${recipe}`);
    });

    return;
  } catch (error) {
    ui.log.write(`! ${error.message}`);
    process.exit(-1);
  }
}

async function bakeRecipe(ui, name) {
  try {
    if (!fs.existsSync(ezbakeDir)) {
      throw new Error(
        `! Could not find .ezbake folder. Please ensure your current working directory is at the root of your .ezbake scaffold`
      );
    }

    // Legacy support
    if (!fs.existsSync(recipeDir)) {
      fs.mkdirSync(recipeDir);
    }
    let recipeDirContents = fs.readdirSync(recipeDir);
    console.log(recipeDir);
    let matchingRecipe = recipeDirContents.find(fileOrDirName => {
      let stats = fs.lstatSync(path.join(recipeDir, fileOrDirName));
      if (stats.isFile()) {
        return fileOrDirName.replace(/\.[^/.]+$/, '') === name;
      }
      return fileOrDirName === name;
    });

    ui.log.write(`. Finding recipe for ${name} in ${recipeDir}...`);
    if (matchingRecipe) {
      ui.log.write(`. Cooking ${name}...`);
      let recipe = require(path.join(recipeDir, `/${matchingRecipe}`));
      let ingredients = {};
      if (Array.isArray(recipe.ingredients)) {
        if (recipe.ingredients.length > 0) {
          let recipesBase = baseIngredients(name, recipe.defaultFileName);
          ingredients = await inquirer.prompt([
            ...recipesBase,
            ...recipe.ingredients
          ]);
        }
      }

      let enhanceDestination = _.template(recipe.destination);
      let destination = path.join(cwd, enhanceDestination(ingredients));

      let fileName = path.join(destination, `/${ingredients.fileName || name}`);
      let bake = _.template(recipe.source);
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
      }

      let answers = {
        overwriteExistingFile: true
      };
      if (fs.existsSync(fileName)) {
        answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwriteExistingFile',
            message: `${fileName} exists. Would you like to continue and overwrite this file`,
            default: true
          }
        ]);
      }

      if (answers.overwriteExistingFile) {
        fs.writeFileSync(fileName, bake(ingredients), { encoding: 'utf-8' });
        ui.log.write(`. Successfully cooked ${name}!`);
        let gitAnswers = {
          stageChanges: false
        };
        if (fs.existsSync(path.join(cwd, './.git'))) {
          gitAnswers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'stageChanges',
              message: `Would you like to stage this new file as a new commit to git?`,
              default: true
            }
          ]);
        }

        if (gitAnswers.stageChanges) {
          await stageChanges(
            ui,
            `[ezbake] - cooked new Recipe - ${fileName}`
          ).catch(error => {
            ui.log.write(`! ${error.message}`);
          });
        }

        if (recipe.icing && Array.isArray(recipe.icing)) {
          ui.log.write(`. Applying icing...`);
          for (let icing of recipe.icing) {
            if (Array.isArray(icing.cmd)) {
              ui.log.write(`  . ${icing.description}`);
              await executeCommand(addIngredients(icing.cmd, ingredients));
            }
          }
          ui.log.write(`. Icing applied!`);
        }
        process.exit(0);
      }

      process.exit(0);
    }

    throw new Error(`! Could not find recipe for ${name}. Please try again.`);
  } catch (error) {
    ui.log.write(error.message);
    process.exit(1);
  }
}
