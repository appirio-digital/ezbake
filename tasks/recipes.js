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

module.exports = {
  menu,
  bakeRecipe
};

function menu(ui) {
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
}

async function bakeRecipe(ui, name) {
  try {
    if (!fs.existsSync(ezbakeDir)) {
      throw new Error(
        `! Could not find .ezbake folder. Please ensure your current working directory is at the root of your .ezbake scaffold`
      );
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
      let destination = path.join(cwd, recipe.destination);
      let ingredients = {};
      if (Array.isArray(recipe.ingredients)) {
        if (recipe.ingredients.length > 0) {
          ingredients = await inquirer.prompt(recipe.ingredients);
        }
      }

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
        await stageChanges(ui, `[ezbake] - baked ${fileName}`).catch(error => {
          ui.log.write(`! ${error.message}`);
        });
        if (recipe.icing && Array.isArray(recipe.icing)) {
          ui.log.write(`. Applying icing...`);
          recipe.icing.forEach(icing => {
            if (Array.isArray(icing.cmd)) {
              ui.log.write(`  . ${icing.description}`);
              let output = executeCommand(
                addIngredients(icing.cmd, ingredients)
              );
              if (output.toString()) {
                ui.log.write(`    . ${output.toString()}`);
              }
            }
          });
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
