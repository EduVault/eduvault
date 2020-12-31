# Notes

## TO DO

- [ ] Basic project set up.
  - [x] Hot reloading for dev, SSL for production. All dockerized
  - [ ] Env variables in docker-compose and nginx
- [ ] Migrate old MVPs
  - [ ] Move login page to be served by backend (data home app) login should then be a redirect operation.
  - [ ] MVP frontend move to 'examples' folder
- [ ] Migrate official site

## thoughts

make example old app without login page, make the login actions into an sdk, sdk should be in this repo too so I don't have to npm publish etc every change

migrate to yarn
migrate to vue 3
get rid of boostrap-vue in favor of tailwind

If private key is stored client-side (local-first, user-owned) then it will be accessible from any browser app/script and that's a huge security concern. To solve this (at the expense of some UX) we can offer two ways to unlock DB, either with EduVault login (pw, wallet, oAuth) which requires online connection, or offline unlock with a PIN.
Private key (Identity) will be stored client-side encrypted in these two ways. Eduvualt login page will have http only cookie that decrypts and sends that back to the app.
Another way to solve this, is simply not use ThreadDB client-side, or that the client-side ThreadDB is a separate DB, but that can sync to the remote one. Of course, this still requires those credentials be stored locally, but the damage possible is much smaller. could do a back-up of the cloud server every time before it syncs with local.
question? Can the local-first ThreadDB have a different private key? MAybe yes, but you still need the private key of the cloud DB

SDK - register what parts of the VueX state correspond to what parts of the ThreadDB. Relations must be managed manually. Either that, or you need to reorganize your Vuex State to match the DB in terms of collections/instances.

Collection: need to define collection name/ID
instance: need instance ID
data fields: as per schema

registry could just a an object with the keys as the vuex store and the values as the DB location.
string constructed as
`collection-name:instance-ID:feild`

```javascript
// the keys should match the local store
'store':{
  userInfo: {
    userName: '',
    userAge: '',
  }
}
'registry': {
  userInfo:
  {
    userName: 'User:<instance-ID>:userName',
    userAge: 'User:<instance-ID>:userAge',
  }
}
```

Or 'matching' method:

```js
'store':{
  User:[
    {
      ID: '<instance-ID>'
      userName: '',
      userAge: '',
    }
  ]
}
```

also need a reducer:

```js
'reducer':[
  // include:
  'User', // or in the first case 'userInfo'
  'User.userName' // to be more specific
]
```

need to create an app registry, and give out developer keys.... wait a minute these can't live in the client-side either or ill get spammed... we can just do app_id, not app_secret, then block that app_id if it's spamming. but wait, any use that uses the app can see that app_id... hmmm.
in this case, it just has to be that it's a verified user, don't worry about apps at all? Maybe have a registry just to keep track of use, and to post schemas of course.
y

originally using textile client, auth flow also required user keys on the frontend, but because using the hub required the dev keys, it had to do the funky signing thing. now the local first just needs a dev to get a token first server side, then send to client and can use that to 'set' the server. then the client needs the user keys to initialize the DB.

Can you have multiple threadDB local-first DBs running at the same time?
How can you do sharing? without ACL, all you can do is create a new ThreadDB and send them the keys.

auth flow:

app
click <a> link, redirects to login page. Include app_id, one time code
|
v
login
depending on login method, ex. password. Sends login info and gets back encrypted

\*\* problem: originally, user could remained easily logged in by using a cookie, if the cookie was valid, they would get back the jwt and unlock credentials. Now, because the final app does not

- problem: for local-first, the credentials must be continually available locally(client side). How can you keep them available without letting other apps see it?
  only answer I can think of now is using a PIN or the user's password.
  look into the comment someone said about using PINs. obvs just 6 numbers isn't great security.

--example
first time using app must be online.
redirects to eduvault/app/login/?code=aasdf1324?redirect_url=https://www.example.com?
--backend. must be registered host. set up database for that.
--app
goes through the original multi-path auth challenge stuff to receive UserAuth
--example
gets back identity and from server and decrypts it.
encrypts ID with 'code' from login redirect query.
redirects to the app's provided redirect URL www.example.com?id=<encrypted_id>&user_auth=<UserAuth>
creates local DB
calls auth server again to get UserAuth
sets remote `db.remote.setUserAuth()`
syncs

on changes, sync again,
try again when online
