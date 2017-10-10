module.exports = [
  {
    type: 'input',
    name: 'projectName',
    message: `Please enter the name for this project`,
    default: 'ads-baseline-webapp',
    filter: (val) => {
      return val.replace(' ', '-');
    }
  },
  {
    type: 'input',
    name: 'projectAuthor',
    message: `Please enter an author for this project`,
    default: `Appirio Digital Studios <ads@appirio.com>`
  },
  {
    type: 'input',
    name: 'projectDescription',
    message: `Please enter a description for this project`,
    default: `An ADS baseline`
  },
  {
    type: 'input',
    name: 'gitRepoURL',
    message: 'Please copy/paste the URL of the Git repo',
    default: 'https://github.com/appirio-digital/ads-baseline-webapp.git'
  }
];