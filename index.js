const inquirer = require('inquirer');

const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: `Please enter the name for this project`,
    default: 'ads-nodejs-baseline',
    filter: (val) => {
      return val.replace(' ', '-');
    }
  },
  {
    type: 'input',
    name: 'portStart',
    message: `Please enter the starting port for your local Docker services`,
    default: '60000'
  }
]

async function run() {
  try {
    let answers = await inquirer.prompt(questions);
    console.log(`Please confirm your preferences`);
    console.log(JSON.stringify(answers));
  } catch (error) {
    console.error(error);
  }
}

run();