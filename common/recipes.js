module.exports = {
  baseIngredients
};

function baseIngredients(recipeName, defaultFileName) {
  return [
    {
      type: 'input',
      name: 'fileName',
      message: `Please specify a file name for this new ${recipeName}`,
      default: `${defaultFileName || recipeName}`
    }
  ];
}
