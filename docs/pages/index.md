---
title: "ezbake: The Project Scaffolder for Everyone"
---

Many smart developers want to turn their projects into boilerplates or reusable scaffolds for other developers to use.  

While there are options from which to choose, most project scaffolders enforce some very heavy opinions and conventions. Instead of letting an author simply layer on a utility that templatizes a project, most scaffolders force authors to adhere to strict guidelines, file structures, and conventions.

No more! `ezbake` is the utility that works _for_ the project author and not vice versa. Layer on `ezbake` and remove it at will.  Templatize all or part of your project.  Release to consumers.  Enhance it with recipes.

Have your cake and it eat it too with `ezbake`.

## Prerequisites

* [Node.js](https://nodejs.org) 8.6 or higher
* [`git`](https://git-scm.com/) installed locally and on your command line's PATH

## Installation

`npm i -g @appirio/ezbake`

## Usage

Execute `ezbake --help` to see the list of valid commands.

You may also execute `ezbake <command> --help` to see the list of options per command.

## Sample

`ezbake sync -r https://github.com/ericnograles/ads-baseline-madlibs.git`
