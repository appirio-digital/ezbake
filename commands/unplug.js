const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const { unplug } = require('../tasks/project');

module.exports = {
  command: 'unplug',
  desc: 'removes ezbake from a project',
  builder: {},
  handler: async argv => {
    let args = sanitizeArgs(argv);
    unplug(ui);
    process.exit(0);
  }
};
