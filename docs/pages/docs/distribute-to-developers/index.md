---
title: Distribute to Developers
---

# Installation

Have your developers execute the following command:

`npm i -g @appirio/ezbake`

# Using ezbake Projects

`ezbake` has no central registry and assumes that you will grant proper access and information to a remote git repo that a user may reference when executing `ezbake prepare`.

Please remember to provide not only the git repo's URL, but also, the branch on which your ezbake project lives. Generally, users will consume your project with the following command:

`ezbake prepare -r https://some.git.platform.com/some_repo.git -b ezbake`
