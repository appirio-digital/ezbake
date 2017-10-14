#!/usr/bin/env node
const inquirer = require('inquirer');
const _ = require('lodash');
const yargs = require('yargs');

// Only watch for <%= %> swaps, lodash template swaps ES6 templates by default
_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

console.log(require('./logo'));

// Understood commands
const args = yargs
  .commandDir('./commands')
  .command('*', 'the default command', () => {}, (argv) => {
    console.log('! Welcome to ezbake');
    console.log(`? Please type ezbake --help for information.`)
    process.exit(0);
  })
  .help()
  .argv;

