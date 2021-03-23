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

## Dev: local

### Get local SSL certs and cert authority

install [mkcert](https://github.com/FiloSottile/mkcert/)
then use the script `yarn make-certs` to generate certs for local development with ssl

### set up local nginx

Yyou must have nginx running on your machine, using the configuration in `deploy/nginx/local/app.conf`. You will probably need to edit the paths in there. Find location to your local nginx version `servers` folder. Then copy/symlink to that folder, in my case it was `/usr/local/Homebrew/etc/nginx/servers`.

```bash
# your nginx servers folder and nginx start command may vary
ln deploy/nginx/local/app.conf /usr/local/Homebrew/etc/nginx/servers
```

then add the following to `/etc/hosts`:

```bash
127.0.0.1	app.localhost
127.0.0.1	api.localhost
127.0.0.1	example.localhost
```

```bash
# will install everything, build the shared library and sdk, and set up symlinks
yarn inst
```

then start nginx with brew(mac) or systemctl (linux)

```bash
brew services start nginx
```

finally

```bash
yarn dev
```

## Dev: with Docker

Only detects changes and hot-reloads these folders: ./app/src ./example/src ./api/src and ./home-page/src

Will not detect changes to ./shared and ./sdk/js. If you make changes to those, you will need to rebuild them and restart the docker image. You will also need to replace the links e.g. `yarn remove:shared` then `yarn reinstall:shared`

### Get local SSL certs and cert authority

install [mkcert](https://github.com/FiloSottile/mkcert/)
then use the script `yarn make-certs` to generate certs for local development with ssl

```
yarn d-dev
```

note: for mac m1 docker dev, you will need to change the nginx image in docker-compose.yml files. See the inline comments.

### Test

```bash
# --broken since move to https--
# End to end integration test. with Cypress. Requires 'yarn dev' to be running.
yarn test:e2e
yarn test-watch:e2e # with watching/ hot-reloading

# api unit
yarn test:api
yarn test-watch:api # with watching/ hot-reloading

# --broken since move to https--
# sdk test: somewhat integrated (requires API to be running -- `yarn dev:api`)
yarn test:sdk-js
yarn test-watch:sdk-js # with watching/ hot-reloading

```

### Dev deploy

Recreate the production deploy on your local machine with:

```bash
yarn dev-build
```

### To deploy

for a staging build, change the .env PROD_HOST to the staging server host name (e.g. staging-site.com)
You can use the `dev-build` build for staging on your local machine or on the server.

for production deploy:

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

# ssh copy in .env file or manually edit
## might also need to config /etc/hosts as per the local example?

# First build:
# Run script for SSL certificate: init-letsencrypt.sh (make sure to change url first)
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
# subsequent builds:
yarn production
```
