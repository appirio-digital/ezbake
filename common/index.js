const inquirer = require('inquirer');
const ui = new inquirer.ui.BottomBar();
const ingredients = require('./ingredients');
const logo = require('./logo');
const _ = require('lodash');

module.exports = {
  sanitizeArgs,
  ui,
  handle,
  invalidGitRepo,
  ingredients,
  addIngredients,
  logo
};

function sanitizeArgs(argv) {
  // Remove any yargs-specific keys to avoid false positives
  let args = { ...argv };
  delete args._;
  delete args.help;
  delete args.version;
  delete args['$0'];
  return args;
}

function handle(error) {
  ui.log.write(error.message);
  process.exit(-1);
}

function invalidGitRepo(error) {
  throw new Error(
    `! This is not a valid ezbake project. Please see the conventions here: https://appirio-digital.github.io/ezbake/docs/\n  ! ${error.message}`
  );
}

/**
 * Adds ingredients (e.g. template values) to an array of cmd's
 * @param {Array} cmd - A string array of commands to execute as icing 
 * @param {Object} ingredients - An object of all ingredients collected
 */
function addIngredients(cmd, ingredients) {
  return cmd.map(cmdItem => {
    let icingTemplate = _.template(cmdItem);
    return icingTemplate(ingredients);
  });
}
