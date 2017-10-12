const fs = require('fs');
const minimatch = require('minimatch');
const path = require('path');
const _ = require('lodash');
const cwd = path.resolve(process.cwd());
const { walkSync } = require('./filesystem');

module.exports = {
  readTemplateJs,
  deleteTemplateJs,
  templateReplace
};

function isValidFile(file, validFiles) {
  let fileMatches = Object.keys(validFiles).some(filePattern => {
    let fileMatch = minimatch(file, filePattern);
    return fileMatch && validFiles[filePattern];
  });

  let ignoreMatches = Object.keys(validFiles).some(filePattern => {
    let fileMatch = minimatch(file, filePattern);
    return fileMatch && validFiles[filePattern] === false;
  });

  return fileMatches && !ignoreMatches;
}

function readTemplateJs(ui, projectName) {
  const pathToTemplateJs = path.join(cwd, `./${projectName}/.template.js`);
  ui.log.write(`. Reading ${pathToTemplateJs}...\n`);
  return require(pathToTemplateJs);
}

function deleteTemplateJs(ui, projectName) {
  const pathToTemplateJs = path.join(cwd, `./${projectName}/.template.js`);
  fs.unlinkSync(pathToTemplateJs); // Bye felicia
}

function templateReplace(ui, answers, templateJs) {
  const pathToProject = path.join(cwd, `./${answers.projectName}`);
  let fileGlobs = templateJs.files || {};
  let files = walkSync(pathToProject);
  files.forEach(file => {
    if (isValidFile(file.path, fileGlobs)) {
      ui.log.write(`. Swapping template values for ${file.path}...\n`);
      let fileTemplate = _.template(fs.readFileSync(file.path));
      fs.writeFileSync(file.path, fileTemplate(answers), { encoding: 'utf8' });
    }
  });
}
