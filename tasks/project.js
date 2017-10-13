const fs = require('fs');
const minimatch = require('minimatch');
const path = require('path');
const _ = require('lodash');
const cwd = path.resolve(process.cwd());
const { walkSync } = require('./filesystem');

module.exports = {
  readProjectRecipe,
  bakeProject
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

function readProjectRecipe(ui, projectName) {
  const pathToRecipe = path.join(cwd, `./${projectName}/.ezbake`);
  ui.log.write(`. Reading ${pathToRecipe}...\n`);
  return require(pathToRecipe);
}

function bakeProject(ui, answers, recipe) {
  const pathToProject = path.join(cwd, `./${answers.projectName}`);
  let fileGlobs = recipe.source || {};
  let files = walkSync(pathToProject);
  files.forEach(file => {
    if (isValidFile(file.path, fileGlobs)) {
      ui.log.write(`. Swapping template values for ${file.path}...\n`);
      let fileTemplate = _.template(fs.readFileSync(file.path));
      fs.writeFileSync(file.path, fileTemplate(answers), { encoding: 'utf8' });
    }
  });
}
