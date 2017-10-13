# ezbake

**The project scaffolder for everyone**

ezbake is the command line utility for authoring, scaffolding, and distributing baseline projects of all types.

## Goals

1. **Anyone can create a scaffold**: Low-fi, easy to understand conventions aimed at ADS work
1. **Onboarding in 15 minutes or less**: A brand new developer should be up and running quickly
1. **Opinionated, but open to extension**: Goes easy on crazy abstractions, but can be extended to scaffold most any type of project

## Architecture

This utility is driven by the core Node.js framework and three libraries:

* [inquirer](https://www.npmjs.com/package/inquirer): Prettified console prompts
* [lodash](https://www.npmjs.com/package/lodash): Swiss-army knife JavaScript library for templating
* [minimatch](https://www.npmjs.com/package/minimatch): The official NPM library for glob matching

## Prerequisites

1. [Node Version Manager](https://github.com/creationix/nvm)
1. `nvm install 8.6.0`
1. `nvm alias default 8.6.0`

## Installation

`npm install -g https://github.com/appirio-digital/ezbake.git`

## Starting a New ezbake Project

1. Execute `ezbake --start`
1. Answer the prompts
1. When prompted for a source Git repo, copy and paste a Git URL that [follows the conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md)
1. Profit

## Developing a Template Project

See [CONVENTIONS.MD](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for instructions on how to templatize your Git project.

