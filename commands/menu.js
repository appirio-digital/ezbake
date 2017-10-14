const yargs = require('yargs');
const { sanitizeArgs, ui, handle } = require('../common');

const {  
  menu
} = require('../tasks/recipes');

module.exports = {
  command: 'menu',
  desc: 'for an existing ezbake project, lists available recipes',
  builder: {},
  handler: async (argv) => {
    let args = sanitizeArgs(argv);
    menu(ui);
    process.exit(0);
  }
}