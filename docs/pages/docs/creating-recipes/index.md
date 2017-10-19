---
title: Creating Recipes
---

You'll notice that our sample project has a `recipes` folder under `.ezbake`. This is where your generators, called `recipes` will live.

# Development

At their core, `recipes` are plain Node.js modules.  As such, whatever you can do in Node in terms of breaking up a module is what you can do with your recipe.

# Execution

Developers may create recipes off their ezbaked project by running `ezbake cook -r RecipeName`, where RecipeName is the file name or folder name of a recipe.

**Note**: This command must be run at the root of the ezbaked project.

# Properties

## description

The description to be listed when a user executes `ezbake menu`.

## destination

The destination directory on which the created file will live. This is in relation to the root of a project that was scaffolded by `.ezbake`

Note that this can be dynamically set using ingredients.  For example, specifying `destination: '<%= destination %>'` will correspond to an ingredient named `destination` for which you can prompt a user.  It will always be in relation to the root of a project.

## source

A [JavaScript template literal string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) of the file's contents, with template strings to swap out.

## ingredients

The keys of the `ingredients` is where you would define the inputs from a user via [inquirer](https://www.npmjs.com/package/inquirer).  See the examples on the Inquirer documentation to see how to structure specific questions.  You have full control over the `inquirer` questions to ask, as well as validations, filters, etc.

**Note**: At a minimum, a user will be asked what the fileName will be called.  This is built into ezbake and is accessible with the `fileName` template variable.

## icing

The keys of `icing` is a String array of commands you want to execute after ezbake completes cooking the recipe. This could be anything, from plain bash commands to a reference to an executable script.

You may also execute local commands relative to the root of the project being cloned. For example, above, we packaged an `icing.sh` script at the root of the project and can invoke it directly.

Also, icing commands can be enhanced with `ingredients`. Simply reference the `ingredient.name` using the same template syntax you used for scaffolding your project. (e.g. `<%= someIngredientName >`)

# Example

```js
module.exports = {
  description: 'A sample React file',
  destination: '/components/',
  source: `
  import React from 'react';
  import { connect } from 'react-redux';
  import { Redirect, Route } from 'react-router-dom';
  
  const LOGIN_PATH = '/auth/login';
  
  class <%= componentName %> extends React.Component {
    render() {
      const { component, user } = this.props;
      const { isPrivate } = component;
      const isAuthenticated = user.userEmail;
  
      if (!isPrivate) {
        return <Route {...props} component={component} />;
      } else {
        if (!isAuthenticated) {
          return <Redirect to={LOGIN_PATH} />;
        }
        return <Route {...props} component={component} />;
      }
    }
  }
  
  function mapStateToProps(state) { // ch-ch-change
    const { user, routing } = state;
    return {
      user,
      routing
    };
  }
  
  export default connect(mapStateToProps)(<%= componentName %>);  
  `,
  ingredients: [
    {
      type: "input",
      name: "componentName",
      message: "What is the name of this React component?",
      default: "MyComponent"
    },
    {
      type: "input",
      name: "messageToUser",
      message: "Say something to the user: ",
      default: "You have just created a React Component. May the odds be ever in your favor."
    }
  ],
  icing: [
    {
      description: 'Calls out to Facebook',
      cmd: ['node', 'web_api_icing.js']
    },
    {
      description: 'Says something to the user',
      cmd: ['say', `"<%= messageToUser %>"`]
    }
  ]
}
```

# Explanation

The above recipe creates a React Component for a user by doing the following:

1. It swaps in the template values from `ingredients` to the `source`
1. It will write the resulting file to the `/components` folder relative to the project root
1. It will execute `node web_api_icing.js` on the root of the project
1. If a git binding is detected, a user will be prompted to stage the changes as a new commit to git
1. It will execute the `say` command with the value provided for the `messageToUser` ingredient