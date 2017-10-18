const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const { bakeRecipe, newRecipe } = require('../tasks/recipes');

module.exports = {
  command: 'cook',
  desc:
    'for use in an exisiting ezbake project, cooks a recipe that has been defined by the author',
  builder: yargs => {
    return yargs
      .command({
        command: 'new',
        desc: 'creates a new blank recipe',
        builder: {},
        handler: async argv => {
          await newRecipe(ui);
        }
      })
      .option('r', {
        alias: 'recipe',
        describe: '(Required) The URL of the Git repo to ezbake'
      });
  },
  handler: async argv => {
    console.log('cook main handler');
    let args = sanitizeArgs(argv);
    if (!args.recipe) {
      ui.log.write(`! You must specify a recipe to cook`);
      process.exit(1);
    }
    await bakeRecipe(ui, args.recipe).catch(handle);
  }
};
