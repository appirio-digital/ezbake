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

## Scaffolding an ezbake Project

1. Execute `ezbake --start`
1. Answer the prompts
1. When prompted for a source Git repo, copy and paste a Git URL that [follows the conventions](https://github.com/appirio-digital/ezbake/blob/master/CONVENTIONS.md)
1. Have your cake and eat it too
