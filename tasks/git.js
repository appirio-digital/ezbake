const path = require('path');
const cwd = path.resolve(process.cwd());
const { spawn, exec } = require('child_process');

module.exports = {
  cloneRepo,
  deleteGitFolder,
  establishLocalGitBindings,
  pushLocalGitToOrigin
};

function cloneRepo(ui, url, projectName) {
  return new Promise((resolve, reject) => {
    // Assumption: Any source repos will have a template branch that we can use
    ui.log.write(`. Cloning ${url} to ./${projectName}\n`);
    const clone = spawn('git', [`clone`, `-b`, `template`, url, projectName]);
    clone.on('data', data => {
      ui.updateBottomBar(data);
    });

    clone.on('close', code => {
      if (code !== 0) {
        return reject(
          new Error(
            `Could not clone repository properly. Please check for the existence of a template branch or your permissions to that Git repo.`
          )
        );
      }
      ui.log.write(`. Finished cloning ${url} to ./${projectName}\n`);
      return resolve();
    });

    clone.on('error', error => {
      reject(error);
    });
  });
}

function deleteGitFolder(ui, projectName) {
  return new Promise((resolve, reject) => {
    const pathToGit = path.join(cwd, `./${projectName}/.git`);
    ui.log.write(`. Removing .git folder from ${pathToGit}\n`);
    const del = spawn('rm', ['-rf', pathToGit]);
    del.on('data', data => {
      ui.updateBottomBar(data);
    });

    del.on('close', code => {
      if (code !== 0) {
        return reject(
          new Error(
            `Could not delete .git from the template. Do you have the proper permissions on this folder?`
          )
        );
      }
      ui.log.write(`. Finished deleting .git folder\n`);
      return resolve();
    });
  });
}

function establishLocalGitBindings(ui, projectName) {
  return new Promise((resolve, reject) => {
    const pathToProject = path.join(cwd, `./${projectName}`);
    ui.log.write(`. Establishing new local .git bindings...\n`);
    exec(
      `cd ${pathToProject} && git init && git add . && git commit -m "initial scaffold"`,
      (err, stdout, stderr) => {
        if (err || stderr) {
          return reject(
            new Error(
              `! Could not establish a local git binding in ${pathToProject}. Please check your permissions or if git exists on your PATH.`
            )
          );
        }
        ui.log.write(
          `. Finished establishing new local .git binding in ${pathToProject}.\n`
        );
        return resolve();
      }
    );
  });
}

function pushLocalGitToOrigin(ui, gitOriginURL, projectName) {
  // Assumption: process is already changed to the project directory
  return new Promise((resolve, reject) => {
    const pathToProject = path.join(cwd, `./${projectName}`);
    ui.log.write(`. Pushing to ${gitOriginURL}\n`);
    exec(
      `cd ${pathToProject} && git remote add origin ${gitOriginURL} && git push -u origin master`,
      (err, stdout, stderr) => {
        ui.log.write(`  . ${stdout}\n`);
        if (err) {
          return reject(
            new Error(
              `! Could not push to ${gitOriginURL}. Please check your permissions and also verify the repo is empty.`
            )
          );
        }
        ui.log.write(`. Finished pushing to ${gitOriginURL}.\n`);
        return resolve();
      }
    );
  });
}
