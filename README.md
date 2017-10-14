![logo](https://github.com/appirio-digital/ezbake/blob/master/ezbake-logo.png)

## The Problem

Most project scaffolders available enforce some very heavy opinions and conventions. Instead of letting an author simply layer on a utility that templatizes a project, most scaffolders force authors to adhere to strict guidelines and structures.

No more! `ezbake` is the utility that works _for_ the project author and not vice versa. Layer on `ezbake` and remove it at will.  Templatize all or part of your project.  Release to consumers.  Enhance it with recipes.

Have your cake and it eat it too with `ezbake`.

## Developing an `ezbake` Project

See [CONVENTIONS.MD](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for instructions on how to templatize your Git project.

Here is a sample repo which is `ezbake` enabled: https://github.com/ericnograles/ads-baseline-madlibs/tree/ezbake

## Prerequisites

* [Node.js](https://nodejs.org) 8.6 or higher
* [`git`](https://git-scm.com/) installed locally and on your command line's PATH

## Installation

`npm install -g https://github.com/appirio-digital/ezbake.git`

## Usage

Execute `ezbake --help` to see the list of valid commands.

You may also execute `ezbake <command> --help` to see the list of options per command.

### ezbake plug

#### Description

This command is intended to add `ezbake` support to a project. This will create an `.ezbake` folder in the current working directory.  This command is primarily used by authors who want to enable `ezbake` templating for their users.

#### Options

n/a

#### Sample

`ezbake plug`

### ezbake unplug

#### Description

This command will remove the `.ezbake` folder from a project that is using it.

#### Options

n/a

#### Sample

`ezbake unplug`

### ezbake prepare [options]

#### Description

This command is intended to scaffold a project from a given Git URL source.  If it is not provided in the command line, you are prompted for it.

Authors: See our [conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for more details.

#### Options

* `-r`: The full URL of the Git repo to use a source. This Git repo should have an `ezbake` branch which has been initialized with `ezbake init` by the author.
* `-o`: The full URL of the Git repo to use as the origin for the created ezbake scaffold. It should be a completely empty repository.

#### Sample

`ezbake prepare -r https://github.com/ericnograles/ads-baseline-madlibs.git`

### ezbake cook [options]

#### Description

This command is to be used within a project that has been created using `ezbake prepare`.  This is the command which will cook a recipe for the user.  Authors should specify the available Recipes in their project's README.md.

Optionally, you may look in the project's `.ezbake/recipes` folder to see what is available.

Authors: See our [conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for more details.

#### Options

* `-r`: The name of the recipe to cook. These are the recipes defined in the `.ezbake/recipes` folder.

#### Sample

`ezbake cook -r Query`

### ezbake menu

#### Description

This command lists the available recipes in an existing `ezbake` project.

Authors: See our [conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for more details.

#### Options

n/a

#### Sample

`ezbake menu`

### ezbake sync [options]

#### Description

This command allows a user to resynchronize their `.ezbake` folder with the latest published by the author.

As an escape hatch, a user can also manually specify another Git source from which to pull the syncing operation.

**Note**: This is a destructive action and will remove your project's recipes and replace them with whatever recipes are defined from the Git repo you specify at the time of execution.

#### Options

* `-r`: (Optional) The full URL of a Git repo to use a source. This Git repo should have an `ezbake` branch which has been initialized with `ezbake init` by the author.

#### Sample

`ezbake sync -r https://github.com/ericnograles/ads-baseline-madlibs.git`
