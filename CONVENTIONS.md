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

A `template.json` is a file that defines what standard template questions to ask (via the `fields` property) as well as what `.env` lines to create for `dotenv` support.

Below is a sample file

```json
{
  "fields": {
    "localPortPostgres": true,
    "localPortRedis": true,
    "localPortWebApp": true,
    "localPortNodeDebugger": true,
    "localPortReactDevServer": true,
    "localPortSwaggerEditor": true
  },
  ".env": {
    "JWT_SECRET": true
  }
}
```

The keys of the `fields` property correspond to a question in the `templateQuestions.js` file.

The keys of the `.env` property tells `ads-baseline` to prompt the user for a value to use for that environment variable in the `.env` file it will create.

