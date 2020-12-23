# EduVault

[Home page](eduvault.org)

## Problems

Some of the ‘last legs’ ing for using [Textile](textile.io)/User-owned data in an interoperable app ecosystem.

### Authentication

- textile only has key pair
- Need progressive auth choices for easy onboarding, oAuth2.0 -> password -> crypto wallets/PKI.

### Discoverability, trust, and curation

- How to find interoperable apps? — data manager lists them. Also have a registry on Textile homepage.
- Apps have access to the data while in use . Data manager app can audit and only list trusted ones.
- How can devs know beforehand what might be in the user-siloed DB? have a registry on Textile and data manager app dev homepage.

### Data management for users

- Need an app where users can browse, edit and mange permissions to all of their data in a friendly GUI.

### Steep learning curve for devs

- SDKs. Abstract away auth and sync

### Paying for and backing up user-owned data

- Each app shouldn’t have to worry about this. Data management app could handle this aspect.

### Handling merge conflicts

- GUI for the user to handle conflicts. —part of SDKs

## Solutions (EduVault)

1. Auth server,
2. Data management (could be called “my data home”) app, app store, my data, login page
3. SDKs/frontend libraries

The auth server and data home app will be found in this repo and the SDKs will be seperate repos

### TO DO

- [ ] Basic project set up.
  - [x] Hot reloading for dev, SSL for production. All dockerized
  - [ ] Env variables in docker-compose and nginx
- [ ] Migrate old MVPs
  - [ ] Move login page to be served by backend (data home app) login should then be a redirect operation.
  - [ ] MVP frontend move to 'examples' folder

### To dev

```bash
docker-compose up
```

#### Dev deploy

Recreate the production deploy on your local machine (without SSL)with

```bash
docker-compose -f docker-compose-dev-build.yml up
```

### To deploy

```bash
# change your path
cd /Users/chenlu/Documents/IPFC/
# change your server ssh
ssh -i "eduvault-1.pem" ec2-user@ec2-52-15-112-97.us-east-2.compute.amazonaws.com
sudo su
service docker start
# copy code into server with git
rm -fr .git #reset old if need be
git init
git remote add origin https://github.com/EduVault/eduvault.git
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh

```
