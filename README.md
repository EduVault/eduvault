# EduVault

[Home page](https://eduvault.org)

EduVault provides a truly user-owned database that syncs across apps.
Eduvault makes it trivially easy for developers to add such a database into an app.

> Note: the word 'user' has been replaced by the word 'person' across this project

## Problems EduVault aims to solve

- Some of the ‘last legs’ are missing for using [Textile](textile.io) and creating a truly Person-owned database with an interoperable app ecosystem.
- EdTech apps lack interoperability

### Authentication

- Because Textile ThreadDB only accepts key pair (PKI) challenges, we need progressive auth choices for easy onboarding:

**least control**(oAuth2.0) -> **more control**(password) -> **most control** (crypto wallets/PKI.)

### Discoverability, trust, and curation

- **How to find interoperable apps?**
  - The Data Manager lists them.
- **How can we deal with the fact that apps still need to be trusted?** (as they must have access to the person's data while in use)
  - The Data Manager app can audit them, and list only trusted ones which do not send let person-data leave the app without permission.
  - The person-owned database can be partitioned, with different permission to different apps (read-only, write only, etc.)
- **How can devs know beforehand what might be in the person-owned DB?**
  - have a schema registry on data manager app dev homepage and within the person-owned DB.

### Data management for Persons ('users')

- Need an app where persons can browse, edit and mange permissions to all of their data in a friendly GUI.

### Steep learning curve for devs

- SDKs abstract away connecting DB, auth, and sync complexities.

### Paying for and backing up person-owned data

- Each app shouldn’t have to worry about this. The Data Management app could handle this aspect.

### Handling merge conflicts

- GUI for the person to handle conflicts. —> part of SDKs

## Solutions (EduVault)

1. Auth server
2. Data Manager app, (or “my data home”)
   includes: app store, my data, login page
3. SDKs/frontend libraries

## Project structure

```
📦 eduvault
 ┣ 📂 api         An auth server to store person credentials and app registration
 ┣ 📂 app         'Data Home' app including app store and 3rd party login handler
 ┣ 📂 example     An example 3rd party app that uses eduvault for login and DB
 ┣ 📂 home-page   The EduVault home and info page
 ┣ 📂 sdk/js      An SDK for quickly adding EduVault into a frontend js webapp
 ┣ 📂 cypress     E2E integration tests
 ┗ 📂 deploy      nginx and ssl config files
```

## Project setup

### Config and env

Changing the .env files (see: example-env files in ./ ./example and ./sdk/js) to your own secrets, and updating the config.ts file in 'shared' should be enough to fork and run the project with your own domain name and Textile/Google/Facebook/DotWallet credentials.

## To dev

you will need to [install mongo-db](https://docs.mongodb.com/manual/administration/install-community/) for the local dev

```bash
# will install everything
yarn inst
# build the shared library and sdk
yarn build:shared && yarn build:sdk-js
# set up symlinks
yarn link-set
```

then

```bash
yarn dev
```

### Test

```bash
# cypress end to end
yarn test-watch:e2e
# api unit
yarn test-watch:api
# sdk test: somewhat integrated (reduires API to be running -- `yarn dev:api`)
yarn test-watch:sdk-js
```

### Dev deploy

Recreate the production deploy on your local machine (without SSL) with:

```bash
yarn dev-build
```

### To deploy

```bash
# connect to your server
sudo su
service docker start
# copy code into server with git
rm -fr .git # Reset old if need be
git init
git remote add origin https://github.com/EduVault/eduvault.git

# to clear and start fresh. Beware, this can erase configurations like the ssl certs.
git reset --hard origin/main
# otherwise just
git pull

# ssh copy in .env file

# Run script for SSL certificate: init-letsencrypt.sh
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
yarn production
```
