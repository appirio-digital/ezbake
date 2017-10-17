const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const { sync } = require('../tasks/project');

module.exports = {
  command: 'sync',
  desc: 'synchronizes the .ezbake folder from the source project',
  builder: yargs => {
    return yargs
      .option('r', {
        alias: 'gitRepoURL',
        describe:
          '(Optional) The URL of the source ezbake project Git repo. Defaults to reading from .ezbake/.gitsource, which was established after ezbake prepare'
      })
      .option('b', {
        alias: 'gitRepoBranch',
        describe:
          '(Optional) The branch on the source repo which contains the .ezbake folder. Defaults to ezbake if not specified'
      });
  },
  handler: async argv => {
    try {
      let args = sanitizeArgs(argv);
      await sync(ui, args).catch(handle);
      ui.log.write(`. Project successfully synced.`);
      process.exit(0);
    } catch (error) {
      ui.log.write(`! Could not sync`);
      if (error.message) {
        ui.log.write(`! ${error.message}`);
      }
      process.exit(-1);
    }
  }
};
