module.exports = {
  source: { 
    "**/*.js": true,
  },
  ingredients: [
    {
      "type": "input",
      "name": "name",
      "message": "What is your name?",
      "default": "Sir Galahad"
    },
    {
      "type": "input",
      "name": "quest",
      "message": "What is your quest?",
      "default": "To seek the Holy Grail"
    },
    {
      "type": "input",
      "name": "airSpeedVelocityUnladenEuropeanSwallow",
      "message": "What is the airspeed velocity of an unladen European swallow?",
      "default": "24mph (source: http://style.org/unladenswallow/)"
    },
  ],
  "env": [
    {
      "type": "input",
      "name": "SOME_SECRET",
      "message": "Please specify a value for SOME_SECRET for the .env file",
      "default": "its_def_a_secret"
    }
  ]
}