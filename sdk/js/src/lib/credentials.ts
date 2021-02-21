import { ThreadID } from '@textile/threaddb';
import { rehydratePrivateKey, testPrivateKey } from '../utils';
import { getJWT, appLogin } from './APICalls';
// import { ulid } from 'ulid';

import { utils, isServerConnected } from '../utils';
const { decrypt, encrypt } = utils;

export interface LoadCredentialsOptions {
  onStart?: () => any;
  onReady?: () => any;
  redirectURL?: string;
  appID?: string;
  log?: boolean;
}

/**
 * Checks queries for login redirect info:
 *  appLoginToken, threadID, pwEncryptedPrivateKey, pubKey, encryptedPrivateKey
 *  see: app/src/store/utils/index => formatOutRedirectURL for what is being sent
 * Checks local storage for jwtEncryptedPrivateKey
 *
 * flow:
 *  first time login:
 *    uses appLoginToken to start session and get jwt and decode token. uses decode token to decrypt keys.
 *  returning login:
 *    uses jwtEncryptedPrivateKey from localStorage,
 *    then uses cookie to get JWT from server to decrypt privateKey
 *  in both cases:
 *    use jwt to get userAuth  (for now must be online. look into whether userAuth can be in localStorage too)
 *    userAuth to start DB */
export async function loadCredentials({
  redirectURL,
  appID,
  log = false,

  onStart,
  onReady,
}: LoadCredentialsOptions) {
  try {
    if (onStart) onStart();
    const online = await isServerConnected();
    const queries = new URL(window.location.href).searchParams;

    /** Returning login */
    // should also have threadID, pubKey, etc. (check app)
    // to do, save persistent data
    const jwtEncryptedPrivateKey = localStorage.getItem(
      'jwtEncryptedPrivateKey'
    );
    let threadIDStr = localStorage.getItem('threadIDStr');
    let pwEncryptedPrivateKey = localStorage.getItem('pwEncryptedPrivateKey');
    let pubKey = localStorage.getItem('pubKey');
    const returningLogin =
      jwtEncryptedPrivateKey && threadIDStr && pwEncryptedPrivateKey && pubKey
        ? true
        : false;

    /** New login */
    let appLoginToken;
    let encryptedPrivateKey;
    if (!returningLogin) {
      threadIDStr = queries.get('thread_id');
      pwEncryptedPrivateKey = queries.get('pw_encrypted_private_key');
      appLoginToken = queries.get('app_login_token');
      encryptedPrivateKey = queries.get('encrypted_private_key');
      pubKey = queries.get('pub_key');
    }

    let threadID: ThreadID | undefined;
    if (threadIDStr)
      try {
        threadID = ThreadID.fromString(threadIDStr);
      } catch (error) {
        console.log({ errorDecodingThreadIDStr: error });
      }
    if (log) {
      queries.forEach((val, key) => console.log(key + ': ' + val));
      console.log({
        appID,
        redirectURL,
        online,
        threadIDStr,
        threadID,
        pwEncryptedPrivateKey,
        jwtEncryptedPrivateKey,
        appLoginToken,
        pubKey,
      });
    }

    let jwts = null;
    if (online && returningLogin) {
      jwts = await getJWT();
      if (log) console.log({ jwts });
      if (jwtEncryptedPrivateKey && jwts && jwts.jwt && threadID && pubKey) {
        console.log({ jwtEncryptedPrivateKey, jwts });
        let keyStr = decrypt(jwtEncryptedPrivateKey, jwts.jwt);
        let usedOldJwt = false;
        // use oldJWT if it didn't work
        if (!keyStr && jwts.oldJwt)
          keyStr = decrypt(jwtEncryptedPrivateKey, jwts.oldJwt);
        if (keyStr) {
          usedOldJwt = true;
        } else return { error: 'unable to decrypt keys' };

        const privateKey = await rehydratePrivateKey(keyStr);
        console.log({ privateKey });

        //should we test the keys better? might require getting ID
        if (privateKey && testPrivateKey(privateKey, pubKey)) {
          if (usedOldJwt) {
            const newJwtEncryptedPrivateKey = encrypt(keyStr, jwts.jwt);
            if (newJwtEncryptedPrivateKey)
              localStorage.setItem(
                'jwtEncryptedPrivateKey',
                newJwtEncryptedPrivateKey
              );
          }
          if (onReady) onReady();
          return { privateKey, threadID, jwt: jwts.jwt };
        } else {
          return { error: 'private key could not be rehydrated' };
        }
      } else {
        return { error: 'incomplete returning login info' };
      }
    } else if (online && !returningLogin) {
      if (
        appLoginToken &&
        appID &&
        encryptedPrivateKey &&
        pubKey &&
        threadID &&
        threadIDStr &&
        pwEncryptedPrivateKey
      ) {
        const appLoginRes = await appLogin(appLoginToken, appID);
        if (appLoginRes) {
          const { jwt, decryptToken } = appLoginRes;
          const keyStr = decrypt(encryptedPrivateKey, decryptToken);
          const privateKey = await rehydratePrivateKey(keyStr);
          if (privateKey && testPrivateKey(privateKey, pubKey)) {
            const newJwtEncryptedPrivateKey = encrypt(keyStr, jwt);
            if (newJwtEncryptedPrivateKey)
              localStorage.setItem(
                'jwtEncryptedPrivateKey',
                newJwtEncryptedPrivateKey
              );
            localStorage.setItem(
              'pwEncryptedPrivateKey',
              pwEncryptedPrivateKey
            );
            localStorage.setItem('threadIDStr', threadIDStr);
            localStorage.setItem('pubKey', pubKey);
            if (onReady) onReady();
            return { privateKey, threadID, jwt };
          } else {
            return { error: 'private key could not be rehydrated' };
          }
        } else return { error: 'appLogin failed' };
      } else return { error: 'incomplete appLogin redirect data' };
    } else if (!online && returningLogin) {
      // create a password input
      console.log('use your password to unlock the database while offline');
      // this mode will only allow local use, can't connect to remote.
      // connect local and connect remote must be separate functions
      return { error: 'offline unlocking not yet available' };
    } else return { error: 'no credentials found' };
  } catch (error) {
    return { error };
  }
}
