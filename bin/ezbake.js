#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { debugLog } = require('../common');

debugLog('System Node Version :: ', process.version);

const fixWhiteSpace = input => {
  if (input.indexOf(' ') > -1) {
    return `"${input}"`;
  }
  return input;
};

const nodeExecPath = path.join(
  os.homedir(),
  '.appirio',
  'modules',
  'ezbake',
  'bin'
);
const nodeExecFileName = `node${os.platform() === 'win32' ? '.exe' : ''}`;
const nodeExec = path.join(nodeExecPath, nodeExecFileName);

if (!fs.existsSync(nodeExec)) {
  process.stdout.write(
    '. Please wait while we install some missing EZBAKE dependencies...'
  );
  const installScriptPath = fixWhiteSpace(
    path.join(__dirname, '..', 'install', 'node.js')
  );
  execSync(`node ${installScriptPath} 8.12.0`);
  process.stdout.write(' Done!!\n');
}

const cliScriptFile = fixWhiteSpace(path.join(__dirname, 'index.js'));
const { argv } = process;

let args = [cliScriptFile];
if (process.argv.length > 2) {
  argv.splice(0, 2);
  argv.forEach((value, index) => {
    if (typeof value === 'string' && value.indexOf(' ') > -1) {
      argv[index] = fixWhiteSpace(value);
    }
  });
  args = args.concat(argv);
}

const cp = spawnSync(fixWhiteSpace(nodeExec), args, {
  shell: true,
  stdio: 'inherit'
});
process.exit(cp.status);
