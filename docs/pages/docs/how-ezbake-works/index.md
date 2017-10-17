---
title: How ezbake Works
---

# Adaptive Scaffolding

ezbake adheres to _your_ project structure, not the other way around.  At its core, ezbake simply is instructed to sweep through specific files defined by globs (the `source`), is given a list of prompts to give the user to fill out these files (`ingredients`), and finally is given a set of commands to execute after it scaffolds the project (`icing`).

Furthermore, for existing projects that are already ezbaked, you can create specific templatized generators called `recipes` to help your developers quickly scaffold boilerplate code.  For example, Redux reducers, MVC controllers, etc.

# Development Approach

When scaffolding a project from scratch, a developer should typically create a separate branch that is ezbaked.  This allows you to continue work on your base branch (presumably, `master`), merge any of your latest scaffolds and recipes back to the ezbake branch, and adhere to your own boilerplate's structures and conventions.

# ezbake prepare: An Example

Under the hood, ezbake uses [lodash templates](https://lodash.com/docs/4.17.4#template) to swap out values for new scaffolds created with `ezbake prepare` and recipes created with `ezbake cook`.

For example, given this hypothetical file `/api/some_module.js`:

```js
module.exports = {
  hello: () => {
    console.log(`hello <%= name %>`)
  }
}
```

...and given the following definition in `.ezbake/index.js`:

```js
module.exports = {
  source: { 
    "**/api/**/*.js": true
  },
  ingredients: [
    {
      "type": "input",
      "name": "name",
      "message": "What is your name?",
      "default": "Sir Galahad"
    }
  ],
  icing: [
    {
      description: 'Tells me the job is done',
      cmd: ['echo', `job's done`]
    }
  ]
}
```

...when a developer uses your project (assuming you keep your ezbaked project on the `ezbake` branch) using `ezbake prepare -r https://github.com/your_username/your_repo.git -b ezbake`, after being prompted for the name of the project they want to scaffold (a new folder that ezbake will create), an author name, and project description, they will be prompted with a question "What is your name?".  Their response will be written to the resulting `/api/some_module.js` of the project name they specified.

Furthermore, after scaffolding the project, ezbake automatically creates a local git repo and commits the scaffold to this repo.  After this, the commands listed in `icing` are run in the order in which they are listed.

# ezbake cook: An Example

Say your developer now has your project. Things are going well, but they need to scaffold a standard ORM object.  Let's say it's defined as follows under `.ezbake/recipes/ORM.js`

```js
module.exports = {
  description: 'A standard ORM file',
  destination: '/models/',
  source: `
    module.exports = {
      name: '<%= objectName %>,
      query: `SELECT * FROM <%= objectName %>`
    }
  `,
  ingredients: [
    {
      type: "input",
      name: "fileName",
      message: "What is the file name for this ORM model?",
      default: "some_table.js"
    },
    {
      type: "input",
      name: "objectName",
      message: "What object are you querying from the database?",
      default: "some_table"
    },
    {
      type: "input",
      name: "messageToUser",
      message: "Say something to the user: ",
      default: "You have just created my recipe. May the odds be ever in your favor."
    }
  ],
  icing: [
    {
      description: `Says job's done`,
      cmd: ['echo', `"job's done"`]
    },
    {
      description: `Says something to the user`,
      cmd: ['echo', `"<%= messageToUser %>"`]
    }
  ]
}
```

At the root of a project, your developer can simply execute `ezbake cook -r ORM`.  They will be prompted with two questions, and hypothetically the following answers: 

1. What is the file name for this ORM model? `user.js`
1. What object are you querying from the database? `user`
1. Say something to the user: `Hello, world`

The result is a file called `user.js` dropped in the `/models` directory of the project that looks like the following:

```js
module.exports = {
  name: 'user',
  query: `SELECT * FROM user`
}
```

Furthermore, when the file is created, you should see the two `echo` commands on the console. You can link `ingredients` to `icing` in the same fashion you templatize your project.

# ezbake sync: An Example

ezbake also associates the source Git repo from which a developer references using `ezbake prepare`.  Should you, as an author, introduce new recipes that you'd like your developers to use, they can simply get the latest and the greatest using `ezbake sync`.

However, let's say you created a new branch altogether that has recipes that you'd like only certain developers to grab.  There is an escape hatch in `ezbake sync` similar to `ezbake prepare`.  By specifing a `-r` and `-b` option, you can "rebase" a project's `.ezbake` folder to another repo and branch.

For example: `ezbake sync -r https://somegitrepo.com/username/second_git_repo.git -b ezbake-v2`