const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const {  
  plug
} = require('../tasks/project');

module.exports = {
  command: 'plug',
  desc: 'ezbake-ifies a project',
  builder: {},
  handler: async (argv) => {
    let args = sanitizeArgs(argv);
    await plug(ui)
      .catch(handle); 
    process.exit(0);
  }
}