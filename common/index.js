const inquirer = require('inquirer');
const ui = new inquirer.ui.BottomBar();
const ingredients = require('./ingredients');
const logo = require('./logo');

module.exports = {
  sanitizeArgs,
  ui,
  handle,
  invalidGitRepo,
  ingredients,
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
    `! This is not a valid ads-baseline. Please see the conventions here: https://github.com/appirio-digital/ads-baseline/blob/master/CONVENTIONS.md\n  ! ${error.message}`
  );
}