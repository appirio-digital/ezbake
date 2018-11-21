const fs = require('fs');
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

const linkSync = (src, dest) => {
  try {
    fs.unlinkSync(dest);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  return fs.linkSync(src, dest);
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
    const parentDir = path.join(process.cwd(), '..');
    const parentBinDir = path.join(parentDir, 'bin');

    try {
      if (!fs.existsSync(parentBinDir)) {
        fs.mkdirSync(parentBinDir);
      }
    } catch (e) {
      throw e;
    }

    linkSync(bin, path.resolve(parentDir, executable));
    deleteFolderRecursive('./node_modules');

    if (platform === 'win') {
      fs.writeFileSync(
        path.resolve(parentBinDir, 'node'),
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
