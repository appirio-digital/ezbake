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
  logo,
  promiseTimeout,
  debugLog
};

function sanitizeArgs(argv) {
  // Remove any yargs-specific keys to avoid false positives
  let args = {
    ...argv
  };
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
    `! Could not clone repo or is not a valid ezbake project. Please see the conventions here: https://appirio-digital.github.io/ezbake/docs/\n  ! ${
      error.message
    }`
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

/**
 * Add a timeout to any promise to ensure it doesn't run forever
 * @param {integer} ms - milliseconds to wait
 * @param {Promise} pendingPromise - the promise to timeout
 */
function promiseTimeout(ms, pendingPromise) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(
        new Error(`TIMEDOUT: Command timed out after ${ms / 1000} seconds`)
      );
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([pendingPromise, timeout]);
}

function debugLog(...messages) {
  _.lowerCase(process.env.EZBAKE_DEBUG_ENABLE) == 'true'
    ? console.log(...messages)
    : '';
}
