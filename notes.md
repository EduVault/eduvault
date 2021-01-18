# Notes

## TO DO

- [ ] Basic project set up.
  - [x] Hot reloading for dev, SSL for production. All dockerized
  - [ ] Env variables in docker-compose and nginx
- [x] Migrate old MVPs
  - [x] Move login page to be served by backend (data home app) login should then be a redirect operation.
  - [x] MVP frontend move to 'examples' folder
- [x] Migrate official site
- [x] Set up js sdk, use in example app
- [ ] Rework auth flow
- [ ] set up dev signup page to register apps to add to cors whitelist, and schema registry
- [ ] move User Model to a shared folder between app and api

## auth flow pseudocode

### example app

eduvault-js-sdk:

```js
checkKeyStorage(){
// on page load, throw in the <head>
if pwEncryptedKeypair keys in localstorage:
  if internet connection:
    redirects to eduvault/app/login/?code=<xxx>&redirect_url=<https://www.example.com>
    use the cookie there to get jwt, decrypt keypair
    send it back encrypted by code
  if no internet:
    asks person for password, decrypts localstorage saved pwEncryptedKeys
  if no keys in storage:
    display <a> link redirects to eduvault/app/login/?code=<xxx>&redirect_url=<https://www.example.com>
}
```

### eduvault app

```js
//  inside home route eduvault.org/ to  /loading:
//  coming to the app from another app --- will have queries: code and redirect
//  fromExternal = has code and redirect
//  fromExternal ? redirect to external app : redirect to app home
//  encryptedKeys = store.state.keys...
//  redirect = fromExternal ? /redirect_url : /home

//  if cookie or (encryptedKeys and cookie):
//    call checkAuth(redirect)

//  else if !encryptedKeys exist:
//    redirect to login/?redirect_url=xxx  // login needs redirect variable in query

// Login route: no check /login
//  inside login():
//       fromExternal ? redirect to external app : redirect to app home


// in router
//  for protected routes --- check for unencrypted keys /home /my-data
//  keysExist = app state has unencrypted keys
//    redirect to desired location /home
//  cookie and encryptedKeys exist and cookie
//    redirect to loading page;
//    call checkAuth
//       redirect to originally desired location   **how does checkAuth know? it must take a redirect param

// *** now pw and metamask login and signup are one endpoint, the server should detect whether its a returning person or not
loginSignup(type){
// type is pw, social media
person inputs email(accountID) and password
password is hashed
an identity(keypair) is created
the keypair is hashed with the plaintext password pwEncryptedKeypair
a ThreadID (DB ID) is created.
the hashed password, encrypted keypair, and thread ID are sent to the server
```

\*\*server

```js
checkUserExist()
saveNewUser(){
  hashes pw again
}
sendBackKeys()
```

### eduvault app

```js
gets cookie, password-encrypted key pair and jwt

storeLoginCredentials(){
  decrypts keypair with password that is still in local app storage.
  stores keypair in local storage encrypted with jwt and also encrypted with password
  encrypts keypair with 'code' from login redirect query.
}
getUserAuth(){
  // previously loginWithChallenge()
  calls server again, this time with websockets, uses the keypair to perform a Textile UserAuth key challenge
}
```

### server

```js
personAuthChallenge(){
  signs the challenge and returns a personAuth object.
}
```

\*\*eduvault app

```js
returnCredentials(){
  redirects to the apps provided redirect URL
  `www.example.com?code_encrypted_id=<code_encrypted_id>&pw_encrypted_id=<pw_encrypted_id>&person_auth=<UserAuth>`
}
```

### example app

eduvault-js-sdk:

```js
storeCredentials(){
  receives codeEncrpytedKeypair, pwEncryptedKeypair, personAuth
  stores pwEncryptedKeypair
  decrypts keys with 'code'
}
createLocalDB(){
  create or find jsthreadDB
  set remote `db.remote.setUserAuth()`
}
syncDB(){}

DB.insert(); DB.save()....
wrapper for threadDB
on changes,or when coming online from being offline, sync again
creates eduvault DB object, can make calls to it based on textile documentated methods. eduvault DB listens for changes and internect connectivity and syncs to remote

```

- problem: for local-first, the credentials must be continually available locally(client side). How can you keep them available without letting other apps see it?
  only answer I can think of now is using a PIN or the person's password.
  look into the comment someone said about using PINs. obvs just 6 numbers isn't great security.
- make each step succinct (put notes in footnotes)
- make each step a function, so people can follow flow easily
- look into ways of forwarding the cookie, to save a trip to the login page
- apps are registered just with url. login page checks if url is registered or not
- Can UserAuth and id be stringified properly?
- How sensitive is textile personAuth? Can it be saved locally?

## musings

make example old app without login page, make the login actions into an sdk, sdk should be in this repo too so I don't have to npm publish etc every change

migrate to vue 3
get rid of boostrap-vue in favor of tailwind

If private key is stored client-side (local-first, person-owned) then it will be accessible from any browser app/script and that's a huge security concern. To solve this (at the expense of some UX) we can offer two ways to unlock DB, either with EduVault login (pw, wallet, oAuth) which requires online connection, or offline unlock with a PIN.
Private key (PrivateKey) will be stored client-side encrypted in these two ways. Eduvualt login page will have http only cookie that decrypts and sends that back to the app.
Another way to solve this, is simply not use ThreadDB client-side, or that the client-side ThreadDB is a separate DB, but that can sync to the remote one. Of course, this still requires those credentials be stored locally, but the damage possible is much smaller. could do a back-up of the cloud server every time before it syncs with local.
question? Can the local-first ThreadDB have a different private key? MAybe yes, but you still need the private key of the cloud DB

provide multiple backup options, like filecoin contract, pinata account, saving the whole database on BSV (or just changes?)

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
  personInfo: {
    accountID: '',
    personAge: '',
  }
}
'registry': {
  personInfo:
  {
    accountID: 'User:<instance-ID>:accountID',
    personAge: 'User:<instance-ID>:personAge',
  }
}
```

Or 'matching' method:

```js
'store':{
  User:[
    {
      ID: '<instance-ID>'
      accountID: '',
      personAge: '',
    }
  ]
}
```

also need a reducer:

```js
'reducer':[
  // include:
  'User', // or in the first case 'personInfo'
  'User.accountID' // to be more specific
]
```

need to create an app registry, and give out developer keys.... wait a minute these can't live in the client-side either or ill get spammed... we can just do app_id, not app_secret, then block that app_id if it's spamming. but wait, any use that uses the app can see that app_id... hmmm.
in this case, it just has to be that it's a verified person, don't worry about apps at all? Maybe have a registry just to keep track of use, and to post schemas of course.
y

originally using textile client, auth flow also required person keys on the frontend, but because using the hub required the dev keys, it had to do the funky signing thing. now the local first just needs a dev to get a token first server side, then send to client and can use that to 'set' the server. then the client needs the person keys to initialize the DB.

Can you have multiple threadDB local-first DBs running at the same time?
How can you do sharing? without ACL, all you can do is create a new ThreadDB and send them the keys.

build out the auth and DB features as classes, that will make making them into SDK's super easy. The eduvault app can use vuex, but the client app should just use localstorage. Make a separate vuex module for client apps, separate from the login SDK which should be pure JS.
