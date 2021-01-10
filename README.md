# EduVault

[Home page](eduvault.org)

## Problems

- Some of the ‘last legs’ are missing for using [Textile](textile.io)/User-owned data in complete, functional and practical interoperable app ecosystem.
- EdTech apps lack interoperability

### Authentication

- Because Textile ThreadDB only accepts key pair (PKI) challenges, we need progressive auth choices for easy onboarding:

least control -> more control -> most control
oAuth2.0 -> password -> crypto wallets/PKI.

### Discoverability, trust, and curation

- **How to find interoperable apps?**
  - The Data Manager lists them.
- **How can we deal with the fact that apps still must be trusted?**, as they will have access to the data while in use.
  - The Data Manager app can audit them, and list only trusted ones.
- **How can devs know beforehand what might be in the user-siloed DB?**
  - have a schema registry on data manager app dev homepage and within the user-owned DB.

### Data management for users

- Need an app where users can browse, edit and mange permissions to all of their data in a friendly GUI.

### Steep learning curve for devs

- SDKs. Abstract away auth and sync

### Paying for and backing up user-owned data

- Each app shouldn’t have to worry about this. The Data Management app could handle this aspect.

### Handling merge conflicts

- GUI for the user to handle conflicts. —part of SDKs

## Solutions (EduVault)

1. Auth server
2. Data Manager app, (or “my data home”)
   includes: app store, my data, login page
3. SDKs/frontend libraries

The auth server and data home app will be found in this repo and the SDKs will be separate repos

## Project structure

```
📦 eduvault
 ┣ 📂 api         An auth server to store user credentials and app registration
 ┣ 📂 app         'Data Home' app, app store, 3rd party login handler
 ┣ 📂 example     An example 3rd party app that uses eduvault for login and DB
 ┣ 📂 home-page   The EduVault home and info page
 ┗ 📂 deploy      nginx and ssl config files
```

## To dev

full docker dev setup with hot reloading.

```bash
yarn dev:d
```

Note: Because of some errors with the Vue dev server, app and example are found at localhost:8081 and 8082 not localhost/app and /example

alternatively, run just the api in docker and the rest locally

```bash
yarn dev:l
```

#### Dev deploy

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
rm -fr .git #reset old if need be
git init
git remote add origin https://github.com/EduVault/eduvault.git

# to clear and start fresh. beware, this can erase configurations like the ssl certs.
git reset --hard origin/main
# otherwise just
git pull

# ssh copy in .env file?

# script for SSL certificate: init-letsencrypt.sh
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
yarn production
```
