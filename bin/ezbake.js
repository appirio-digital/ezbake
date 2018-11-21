#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');
const { debugLog } = require('../common');

debugLog('System Node Version :: ', process.version);

const nodeExecPath = path.join(__dirname, 'node');
const cliScriptFile = path.join(__dirname, 'index.js');
const { argv } = process;

let args = [cliScriptFile];
if (process.argv.length > 2) {
  argv.splice(0, 2);
  args = args.concat(argv);
}

const cp = spawnSync(nodeExecPath, args, {
  shell: true,
  stdio: 'inherit'
});
process.exit(cp.status);
