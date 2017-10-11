# ads-baseline Conventions

## Introduction

`ads-baseline` first prompts the user for four items:

1. A name for the project
    * Spaces are replaced with dashes unless it's Docker-related, in which case spaces are replaced with underscores
1. An author for the project
1. A description for the project
1. The URL of a Git repo to use as a baseline

## Source Git Repo Assumptions

1. It is accessible from your machine, either via https or ssh links
1. It has a `template` branch that `ads-baseline` will use a source
1. It has a valid `.template.js` at the root

## .template.js

A `.template.js` is what drives the `ads-baseline` process. It defines several things for the utility.

### Sample 

```js
module.exports = {
  files: { 
    '**/*.js': true,
    '**/*.json': true,
    '**/*.java': true,
    '**/*.yml': true,
    '**/*.sh': true,
    '**/.vscode/*.json': true,
    '**/Dockerfile': true
  },
  questions: [
    {
      type: 'input',
      name: 'localPortPostgres',
      message: 'Please specify the local port on which to expose the Postgres instance from Docker',
      default: '60000',
      validate: function (value) {
        let valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';
      },
    },
    {
      type: 'input',
      name: 'localPortRedis',
      message: 'Please specify the local port on which to expose the Redis instance from Docker',
      default: '60001',
      validate: function (value) {
        let valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';
      },
    },
    {
      type: 'input',
      name: 'localPortWebApp',
      message: 'Please specify the local port on which to expose the WebApp from Docker',
      default: '60002',
      validate: function (value) {
        let valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';
      },
    },
    {
      type: 'input',
      name: 'localPortNodeDebugger',
      message: 'Please specify the local port on which to expose the Redis instance from Docker',
      default: '60003',
      validate: function (value) {
        let valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';
      },
    },
    {
      type: 'input',
      name: 'localPortSwaggerEditor',
      message: 'Please specify the local port on which to expose the Swagger Editor from Docker',
      default: '60004',
      validate: function (value) {
        let valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';
      },
    }
  ],
  env: [
    {
      type: 'input',
      name: 'JWT_SECRET',
      message: 'Please specify a value for the JWT_SECRET environment variable. This is how we will sign JSON Web Tokens.',
      default: 'shhh_its_a_secret',
    }
  ]
}
```

### Usage

#### files

The keys of the `files` property are [globs](https://www.npmjs.com/package/minimatch) that we use to match files in the directory. Only files that match the glob patterns and with the value set to `true` are template replaced.

All of your globs will start with `**/` to denote any path to either a particular file or set of files.  This is intentional, as `ads-baseline` will match the glob of the full path of the files it creates for you.  After the initial `**/` you can then set whatever glob pattern you like.

#### questions

The keys of the `questions` is where you would define the inputs from a user via [inquirer](https://www.npmjs.com/package/inquirer).  See the examples on the Inquirer documentation to see how to structure specific questions.  You have full control over the `inquirer` questions to ask, as well as validations, filters, etc.

You can then embed in your files the names of the question prompts.  For example, above, `localPortWebApp` would correspond to a templatized value of `<%= localPortWebApp %>` on some file in your project.

#### env

The keys of the `env` is similar to `questions`. They are also [inquirer](https://www.npmjs.com/package/inquirer) prompts that then map to a corresponding .env file value.  For example, the above file would generate a `.env` file in the root of the generated project that looks like the following:

```
JWT_SECRET=shhh_its_a_secret
```

