module.exports = {
  destination: '/sql/',
  source: `
    SELECT * FROM <%= table %>
  `,
  ingredients: [
    {
      "type": "input",
      "name": "fileName",
      "message": "What would you like this SQL file to be named?",
      "default": "query.sql"
    },
    {
      "type": "input",
      "name": "table",
      "message": "What is the name of the table you would like to query?",
      "default": "table"
    }
  ]
}