### TO DO

- [ ] Basic project set up.
  - [x] Hot reloading for dev, SSL for production. All dockerized
  - [ ] Env variables in docker-compose and nginx
- [ ] Migrate old MVPs
  - [ ] Move login page to be served by backend (data home app) login should then be a redirect operation.
  - [ ] MVP frontend move to 'examples' folder
- [ ] Migrate official site

make example old app without login page, make the login actions into an sdk, sdk should be in this repo too so I don't have to npm publish etc every change

migrate to yarn
migrate to vue 3
get rid of boostrap-vue in favor of tailwind

If private key is stored client-side (local-first, user-owned) then it will be accessible from any browser app/script and that's a huge security concern. To solve this (at the expense of some UX) we can offer two ways to unlock DB, either with EduVault login (pw, wallet, oAuth) which requires online connection, or offline unlock with a PIN.
Private key (Identity) will be stored client-side encrypted in these two ways. Eduvualt login page will have http only cookie that decrypts and sends that back to the app.
Another way to solve this, is simply not use ThreadDB client-side, or that the client-side ThreadDB is a separate DB, but that can sync to the remote one. Of course, this still requires those credentials be stored locally, but the damage possible is much smaller. could do a back-up of the cloud server every time before it syncs with local.
question? Can the local-first ThreadDB have a different private key? MAybe yes, but you still need the private key of the cloud DB

SDK - register what parts of the VueX state correspond to what parts of the ThreadDB. Relations must be managed manually. Either that, or you need to reorganize your Vuex State to match the DB in terms of collections/instances.

need to create an app registry, and give out developer keys.... wait a minute these can't live in the client-side either or ill get spammed... we can just do app_id, not app_secret, then block that app_id if it's spamming. but wait, any use that uses the app can see that app_id... hmmm.
in this case, it just has to be that it's a verified user, don't worry about apps at all? Maybe have a registry just to keep track of use, and to post schemas of course.
y

originally using textile client, auth flow also required user keys on the frontend, but because using the hub required
