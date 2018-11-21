const _ = require('lodash');
const yargs = require('yargs');
const { debugLog } = require('../common');

debugLog('CLI Node Version :: ', process.version);

// Only watch for <%= %> swaps, lodash template swaps ES6 templates by default
_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

// Understood commands
const args = yargs
  .commandDir('../commands')
  .command(
    '*',
    'the default command',
    () => {},
    argv => {
      console.log(require('../common').logo);
      console.log('! Welcome to ezbake');
      console.log(`? Please type ezbake --help for information.`);
      process.exit(0);
    }
  )
  .help().argv;
