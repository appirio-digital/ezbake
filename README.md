<img src="https://otviiisgrrr8.files.wordpress.com/2013/12/ez-bake.png" width="150">

# ezbake

**"The Project Scaffolder for Everyone"**

## The Problem

Most project scaffolders available enforce some very heavy opinions and conventions. Instead of letting an author simply layer on a utility that templatizes a project, most scaffolders force authors to adhere to strict guidelines and structures.

No more! `ezbake` is the utility that works _for_ the project author and not vice versa. Layer on `ezbake` and remove it at will.  Templatize all or part of your project.  Release to consumers.  Enhance it with recipes.

Have your cake and it eat it too with `ezbake`.

## Developing an `ezbake` Project

See [CONVENTIONS.MD](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for instructions on how to templatize your Git project.

Here is a sample repo which is `ezbake` enabled: https://github.com/ericnograles/ads-baseline-madlibs/tree/ezbake

## Prerequisites

1. [Node Version Manager](https://github.com/creationix/nvm)
1. `nvm install 8.6.0`
1. `nvm alias default 8.6.0`

## Installation

`npm install -g https://github.com/appirio-digital/ezbake.git`

## Usage

Execute `ezbake --help` to see the list of valid commands.

You may also execute `ezbake <command> --help` to see the list of options per command.

### ezbake plug

#### Description

This command is intended to add `ezbake` support to a project. This will create an `.ezbake` folder in the current working directory.

#### Options

n/a

### ezbake unplug

#### Description

This command will remove the `.ezbake` folder from a project that is using it.

#### Options

n/a

### ezbake prepare [options]

#### Description

This command is intended to scaffold a project from a given Git URL source.  If it is not provided in the command line, you are prompted for it.

Authors: See our [conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for more details.

#### Options

* `-r`: The full URL of the Git repo to use a source. This Git repo should have an `ezbake` branch which has been initialized with `ezbake init`.
* `-o`: The full URL of the Git repo to use as the origin for the created ezbake scaffold. It should be a completely empty repository.

#### Sample

`ezbake prepare -r=https://github.com/ericnograles/ads-baseline-madlibs.git`

### ezbake cook [options]

#### Description

This command is to be used within a project that has been ezbake-ified using `ezbake init`.  This is the command which will cook a recipe for the user.

Authors: See our [conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md) for more details.

#### Options

* `-r`: The name of the recipe to cook. These are the recipes defined in the `.ezbake/recipes` folder.

#### Sample

`ezbake cook -r Query`
