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
1. It has a `template.json` at the root

## template.json

A `template.json` is a file that defines what standard template questions to ask (via the `questions` property) as well as what `.env` lines to create for `dotenv` support.

Below is a sample file

```json
{
  "questions": [
    {
      "type": "input",
      "name": "localPortPostgres",
      "message": "Please specify the local port on which to expose the Postgres instance from Docker",
      "default": "60000"
    },
    {
      "type": "input",
      "name": "localPortRedis",
      "message": "Please specify the local port on which to expose the Redis instance from Docker",
      "default": "60001"
    },
    {
      "type": "input",
      "name": "localPortWebApp",
      "message": "Please specify the local port on which to expose the WebApp from Docker",
      "default": "60002"
    },
    {
      "type": "input",
      "name": "localPortNodeDebugger",
      "message": "Please specify the local port on which to expose the Node Debugger from Docker",
      "default": "60003"
    },
    {
      "type": "input",
      "name": "localPortReactDevServer",
      "message": "Please specify the local port on which to expose the React Dev Server from Docker",
      "default": "60004"
    },
    {
      "type": "input",
      "name": "localPortSwaggerEditor",
      "message": "Please specify the local port on which to expose the Swagger Editor from Docker",
      "default": "60005"
    }
  ],
  ".env": {
    "JWT_SECRET": true
  }
}
```

The keys of the `questions` is where you would define the inputs from a user via [inquirer](https://www.npmjs.com/package/inquirer).  See the examples on the Inquirer documentation to see how to structure specific questions.

You can then embed in your files the names of the question prompts.  For example, above, `localPortWebApp` would correspond to a templatized value of `<%= localPortWebApp %>` on some file in your project.

The keys of the `.env` property tells `ads-baseline` to prompt the user for a value to use for that environment variable in the `.env` file it will create.

