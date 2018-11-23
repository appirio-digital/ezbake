const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const deleteFolderRecursive = p => {
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach(file => {
      const curPath = path.join(p, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(p);
  }
};

const createFolderRecursive = targetDir => {
  targetDir.split(path.sep).reduce((parentDir, childDir) => {
    let currentPath = parentDir;
    currentPath += childDir + path.sep;
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }, '');
};

const linkSync = (src, dest) => {
  try {
    fs.unlinkSync(dest);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  // First try to create a link. If the opertaion fails, create a copy
  try {
    return fs.linkSync(src, dest);
  } catch (e) {
    if (e.code !== 'EXDEV') {
      throw e;
    }
    return fs.copyFileSync(src, dest);
  }
};

const installArchSpecificPackage = (version, require) => {
  process.env.npm_config_global = 'false';
  const platform = process.platform === 'win32' ? 'win' : process.platform;
  const arch =
    platform === 'win' && process.arch === 'ia32' ? 'x86' : process.arch;

  const cp = spawn(
    platform === 'win' ? 'npm.cmd' : 'npm',
    [
      'install',
      '--no-save',
      `${['node', platform, arch].join('-')}@${version}`
    ],
    {
      shell: true,
      stdio: 'inherit'
    }
  );

  cp.on('close', code => {
    const pkgJson = require.resolve(
      `${['node', platform, arch].join('-')}/package.json`
    );
    const subpkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
    const executable = subpkg.bin.node;
    const bin = path.resolve(path.dirname(pkgJson), executable);
    const targetParentDir = path.join(
      os.homedir(),
      '.appirio',
      'modules',
      'ezbake'
    );
    const targetDir = path.join(targetParentDir, 'bin');

    try {
      createFolderRecursive(targetDir);
    } catch (e) {
      throw e;
    }

    linkSync(bin, path.resolve(targetParentDir, executable));
    deleteFolderRecursive('./node_modules');

    if (platform === 'win') {
      fs.writeFileSync(
        path.resolve(targetDir, 'node'),
        'This file intentionally left blank'
      );
    }
    return process.exit(code);
  });
};

process.chdir(__dirname);

// If a nodejs version number is not provided, it will default to version 8.12.0.
let nodeVersion;
if (process.argv.length > 2) {
  // eslint-disable-next-line prefer-destructuring
  nodeVersion = process.argv[2];
  console.log(`. Installing required NodeJS version => ${nodeVersion}...`);
} else {
  nodeVersion = '8.12.0';
  console.log(`. Installing default NodeJS version => ${nodeVersion}...`);
}
installArchSpecificPackage(nodeVersion, require);
