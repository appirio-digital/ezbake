const path = require('path');
const cwd = path.resolve(process.cwd());
const rimraf = require('rimraf');
const { spawn, exec } = require('child_process');

module.exports = {
  cloneRepo,
  deleteGitFolder,
  establishLocalGitBindings,
  pushLocalGitToOrigin,
  stageChanges
};

function stageChanges(ui, commitMessage) {
  return new Promise(
    (resolve, reject) => {
      ui.log.write(
        `. Staging git changes with commit message "${commitMessage}". \n`
      );
      exec(
        `git add . && git commit -m "${commitMessage}"`,
        (err, stdout, stderr) => {
          if (err || stderr) {
            return reject(
              new Error(
                `! Could not stage your git changes. Are you in a valid git repository?`
              )
            );
          }
          ui.log.write(
            `. Finished staging changes. \n`
          );
          return resolve();
        }
      );
    }
  );
}

function cloneRepo(ui, url, projectName) {
  return new Promise((resolve, reject) => {
    // Assumption: Any source repos will have an ezbake branch that we can use
    ui.log.write(`. Cloning ${url} to ./${projectName}\n`);
    const clone = spawn('git', [`clone`, `-b`, `ezbake`, url, projectName]);
    clone.on('data', data => {
      ui.updateBottomBar(data);
    });

    clone.on('close', code => {
      if (code !== 0) {
        return reject(
          new Error(
            `Could not clone repository properly. Please check for the existence of an ezbake branch or your permissions to that Git repo.`
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
    rimraf.sync(pathToGit);
    ui.log.write(`. Finished deleting .git folder\n`);
    resolve();
  });
}

function establishLocalGitBindings(ui, projectName) {
  return new Promise((resolve, reject) => {
    const pathToProject = path.join(cwd, `./${projectName}`);
    ui.log.write(`. Establishing new local .git bindings...\n`);
    exec(
      `cd ${pathToProject} && git init && git add . && git commit -m "get it while it's hot!"`,
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
