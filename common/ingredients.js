module.exports = [
  {
    type: 'input',
    name: 'projectName',
    message: `Please enter the name for this project`,
    default: 'ezbake-sample',
    filter: val => {
      return val
        .replace(/\W+/g, ' ') // alphanumerics only
        .trimRight()
        .replace(/ /g, '-')
        .toLowerCase();
    }
  },
  {
    type: 'input',
    name: 'authorName',
    message: `What's your name?`,
    default: `ezbake`
  },
  {
    type: 'input',
    name: 'authorEmail',
    message: `What's your email address?`,
    default: `ezbake@appirio.com`
  },
  {
    type: 'input',
    name: 'projectDescription',
    message: `Please enter a description for this project`,
    default: `An ezbake project`
  },
  {
    type: 'input',
    name: 'gitRepoURL',
    message: 'Please copy/paste the URL of the Git repo',
    default: 'https://github.com/ericnograles/ads-baseline-madlibs.git'
  },
  {
    type: 'input',
    name: 'gitRepoBranch',
    message: 'Please specify the branch that contains the .ezbake folder',
    default: 'ezbake'
  },
  {
    type: 'input',
    name: 'gitOriginURL',
    message: `(Optional) Want to push this to a new, EMPTY repo? If so, give us a URL`,
    default: null
  }
];