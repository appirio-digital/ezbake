# Contributing to ezbake

Thanks for wanting to contribute! We welcome the community's feedback and want to enhance `ezbake` so that it can truly be the "scaffolder for everyone".  Feel free to fork and PR back to us, but please read the following.

## ezbake Goals

`ezbake` was built with the following goals:

1. It should be a "higher order utility" for an author and not force the author to adhere to a specific folder structure
1. It should always be loosely coupled from a project, technology, and platform (apart from needing Node.js to run, of course). "There if you need it, but not essential to get work done, and easily removed with no drama".
1. It should be as easy for a Node.js developer as it might be for, say, an ML developer, a data scientist, or a Python developer.

## Pull Requests

1. Fork this repo to your personal GH
1. Create a feature branch
1. PR back to `master` here, fill out the pull request template
1. (If applicable) Reference an Issue that your PR references

## Developer Setup

### Suggested Prerequisites

1. [Node Version Manager](https://github.com/creationix/nvm)
1. `nvm install 8.6.0`
1. `nvm alias default 8.6.0`

### package.json Scripts

We've added some convenience functions in the `scripts` of `package.json` to hopefully make development easier. Each script represents all the functionality of the commands in `ezbake`.  

**Note**: These are setup to _not_ begin until you attach a Node debugger to port 5858, via the `inspect-brk` flag.

* `npm run debug:prepare`
* `npm run debug:sync`
* `npm run debug:plug`
* `npm run debug:unplug`
* `npm run debug:cook`
* `npm run debug:menu`

### VSCode Support

We've also added a convenience `.vscode` folder do attach your Node debugger automatically.



