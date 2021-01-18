# mvp-backend

This backend is a simple first version of what EduVault server will offer, which is authentication and creating credentials to work with Textile ThreadDB.

## Auth strategy

Currently the person can log in with a accountID or password or social media account with oAuth. They will recieve a cookie with a session

### Issue that needs resolving

This would be fine for native mobile apps where they an store the JWT securely, but it is not a secure method for the browser, because storing the JWT client in the browser opens the client up to XSS and CSRF attacks. We need to look into moving to cookies and sessions which might be more suited for the browser.

### Textile ThreadDB access

If the person signs up with social media we will store their private key/public key pair on the database, encrypted by a PIN number. If they used password, we will also add a layer of encryption using their password.

On login, they get sent the encrypted key pair. They can save that safely in persisted browser local storage, and store the decrypted keypair in more secure application storage. This means each time they reopen the app, they will need to tpye their pin again, but not their other login info.

They can refresh the connection with the ThreadDB by calling our `/renew-textile` endpoint. They will be issued a challenge by our server, which they can sign with their key pair. They will recieve a `personAuth` object in return

## To run

change the example.env.local to .env.local

```bash
npm install
npm run build

# Make sure you have docker running on your system

# Only needs to be done once:
make setup
# Needs to run each time you add a new dependency:
make install
# Later you can just call this to start:
make dev
```

> server will be available on `localhost:<The port number you used in .env file>` eg. `localhost:3003`
