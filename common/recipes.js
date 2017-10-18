const newRecipeIngredients = [
  {
    type: 'input',
    name: 'recipeName',
    message: `Please specify a name for your new recipe`,
    default: `NewRecipe`,
    filter: val => {
      return val
        .replace(/\W+/g, ' ') // alphanumerics only
        .trimRight()
        .replace(/ /g, '');
    }
  }
];

const recipeTemplate = `
module.exports = {
  destination: '/todo_add_destination_here/',
  source: \`
    TODO: Copy/paste your source here or require it in
  \`,
  ingredients: [
    {
      type: "input",
      name: "todo",
      message: "TODO: Add ingredients to your recipe",
      default: "todo"
    }
  ],
  icing: [
    {
      description: 'TODO: Add icing to your recipe',
      cmd: ['echo', '"TODO: Add icing to your recipe"']
    }
  ]
}
`;

module.exports = {
  baseIngredients,
  newRecipeIngredients,
  recipeTemplate
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
