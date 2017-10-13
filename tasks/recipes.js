const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const _ = require('lodash');
const cwd = path.resolve(process.cwd());
const ezbakeDir = path.join(cwd, './.ezbake');
const recipeDir = path.join(ezbakeDir, './recipes');
const { stageChanges } = require('./git');

module.exports = {
  bakeRecipe
};

async function bakeRecipe(ui, name) {
  try {
    if (!fs.existsSync(ezbakeDir)) {
      throw new Error(`! Could not find .ezbake folder. Please ensure your current working directory is at the root of your .ezbake scaffold`);
    }
    let recipeDirContents = fs.readdirSync(recipeDir);
    console.log(recipeDir);
    let matchingRecipe = recipeDirContents
      .find(fileOrDirName => {
        return fileOrDirName.replace(/\.[^/.]+$/, "") === name;
      });
    
    ui.log.write(`. Finding recipe for ${name} in ${recipeDir}...`);
    if (matchingRecipe) {
      ui.log.write(`. Baking ${name}...`);
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
      fs.writeFileSync(fileName, bake(ingredients), { encoding: 'utf-8'});
      ui.log.write(`. Successfully baked ${name}!`);
      await stageChanges(ui, `ezbake - ${name}`);
      process.exit(0);
    }
  
    throw new Error(`! Could not find recipe for ${name}. Please try again.`);
  } catch (error) {
    ui.log.write(error.message);
    process.exit(1);
  }
  
}