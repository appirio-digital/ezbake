const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const {  
  bakeRecipe
} = require('../tasks/recipes');

module.exports = {
  command: 'cook',
  desc: 'for use in an exisiting ezbake project, cooks a recipe that has been defined by the author',
  builder: (yargs) => {
    return yargs.option('r', {
      alias: 'recipe',
      describe: '(Required) The URL of the Git repo to ezbake'
    })
  },
  handler: async (argv) => {
    let args = sanitizeArgs(argv);
    if (!args.recipe) {
      ui.log.write(`! You must specify a recipe to cook`);
      process.exit(1);
    }
    await bakeRecipe(ui, args.recipe)
      .catch(handle);
    process.exit(0);
  }
}