const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const {  
  sync
} = require('../tasks/project');

module.exports = {
  command: 'sync',
  desc: 'synchronizes the .ezbake folder from the source project',
  builder: (yargs) => {
    return yargs
      .option('r', {
        alias: 'gitRepoURL',
        describe: '(Optional) The URL of the source ezbake project Git repo. Leaving this blank will simply read from .ezbake/.gitsource, which was established after ezbake prepare'
      });
  },
  handler: async (argv) => {
    let args = sanitizeArgs(argv);
    await sync(ui, args)
      .catch(handle);
    ui.log.write(`. Project successfully synced.`);
    process.exit(0);
  }
}