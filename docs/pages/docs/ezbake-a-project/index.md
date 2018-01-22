---
title: ezbake a Project
---

# Quick Start

1. Clone a project you would like to ezbake
1. `cd` into the project and execute `git checkout -b ezbake` (or whatever branch name you wish)
1. `ezbake plug`
1. Develop your scaffold and recipes in the `.ezbake` folder
1. Push the `ezbake` (or whatever branch you named it) to your origin
1. Distribute the git URL and branch name to your developers

# .ezbake/index.js

`index.js` is what drives the `ezbake` process. It defines several things for the utility.

## source

The keys of the `source` property are [globs](https://www.npmjs.com/package/minimatch) that we use to match files in the directory. Only files that match the glob patterns and with the value set to `true` are template replaced.

All of your globs will start with `**/` to denote any path to either a particular file or set of files.  This is intentional, as `ezbake` will match the glob of the full path of the files it creates for you when preparing an existing project.  After the initial `**/` you can then set whatever glob pattern you like.

## ingredients

The keys of the `ingredients` are where you would define the inputs from a user via [inquirer](https://www.npmjs.com/package/inquirer).  See the examples on the Inquirer documentation to see how to structure specific questions.  You have full control over the `inquirer` questions to ask, as well as validations, filters, etc.

You can then embed in your files the names of the question prompts.  For example, above, `localPortWebApp` would correspond to a templatized value of `<%= localPortWebApp %>` on some file in your project.

## env

The keys of `env` is similar to `ingredients`. They are also [inquirer](https://www.npmjs.com/package/inquirer) prompts that then map to a corresponding .env file value.  For example, the above file would generate a `.env` file in the root of the generated project that looks like the following:

```
JWT_SECRET=shhh_its_a_secret
```

## icing

The keys of `icing` is an array of commands you want to execute after ezbake completes scaffolding your project. This could be anything, from plain bash commands to a reference to an executable script.

You may also execute local commands relative to the root of the project being cloned. For example, above, we packaged an `icing.sh` script at the root of the project and can invoke it directly.

Also, icing commands can be enhanced with `ingredients`. Simply reference the `ingredient.name` using the same template syntax you used for scaffolding your project. (e.g. `<%= someIngredientName >`)

## Example 

```js
module.exports = {
  source: { 
    "**/*.txt": true,
    "**/*.sql": true,
    "**/*.yml": true,
    "**/ignore_me.sql": false,
    "**/data/ignore_this_entire_folder/**": false,
    "**/*.sh": true
  },
  ingredients: [
    {
      "type": "input",
      "name": "favoriteFood",
      "message": "What is your favorite food?",
      "default": "Steak"
    },
    {
      "type": "input",
      "name": "favoriteSnack",
      "message": "What is your favorite snack?",
      "default": "Nutella"
    }
  ],
  "env": [
    {
      "type": "input",
      "name": "SOME_SECRET",
      "message": "Please specify a value for SOME_SECRET for the .env file",
      "default": "its_def_a_secret"
    }
  ],
  icing: [
    {
      description: 'Says something on Mac',
      cmd: ['./icing.sh']
    },
    {
      description: 'Tells me the job is done',
      cmd: ['echo', `job's done`]
    }
  ]
}
```

## Execution Steps

When a developer consumes your ezbake project using `ezbake prepare`, the following will happen:

1. The user is prompted for a project name, author, description, git repo source URL and branch (if not specified by `-r` and `-b`), and optionally, a blank git repo to push to.
1. Your ezbaked project gets cloned to a folder with the same name as the `projectName` ingredient
1. `ezbake` reads your `.ezbake/index.js` file for its execution parameters
1. `ezbake` prompts the user for the `ingredients` specified above
1. `ezbake` sweeps through your entire project structure, matching the globs defined in `source` and does template swaps with the `ingredients` collected from the prior step
1. `ezbake` prompts the user for the value of the `env` specified
1. `ezbake` writes a `.env` file at the root of the project with the user collected info from the prior step
1. `ezbake` creates a new local git repo at the root of the project and commits all changes
1. If a remote repo URL was specified, `ezbake` will attempt to push the local repo to the origin's master
1. `ezbake` runs the specified `icing` commands
