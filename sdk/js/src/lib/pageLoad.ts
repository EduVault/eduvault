import { ThreadID } from '@textile/threaddb';
import { URL_APP } from '../config';
import { rehydratePrivateKey, testPrivateKey } from '../utils';
import { getJWT, appLogin } from './APICalls';
// import { ulid } from 'ulid';

import { pageLoadOptions, PageLoadChecksResult } from '../types';

import { utils, isServerConnected } from '../utils';
const { decrypt, encrypt } = utils;

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
export async function pageLoadChecks({
  autoRedirect = false,
  redirectURL,
  appID,
  log = false,
}: pageLoadOptions): Promise<PageLoadChecksResult> {
  try {
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
        autoRedirect,
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
          if (usedOldJwt)
            localStorage.setItem(
              'jwtEncryptedPrivateKey',
              encrypt(keyStr, jwts.jwt)
            );
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
            localStorage.setItem(
              'jwtEncryptedPrivateKey',
              encrypt(keyStr, jwt)
            );
            localStorage.setItem(
              'pwEncryptedPrivateKey',
              pwEncryptedPrivateKey
            );
            localStorage.setItem('threadIDStr', threadIDStr);
            localStorage.setItem('pubKey', pubKey);
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

export const setupButton = (
  buttonID: string,
  redirectURL?: string,
  appID?: string,
  log = false
) => {
  // console.log({ buttonID, redirectURL });
  const button = buttonID ? document.getElementById(buttonID) : null;
  // console.log({ button });

  if (!button) {
    if (log) console.log('button not found');
    return;
  }
  if (!redirectURL) {
    if (log) console.log('redirectURL not found');
    return;
  }
  if (!appID) {
    if (log) console.log('appID not found');
    return;
  }
  button.addEventListener('click', () => {
    if (!redirectURL) redirectURL = window.location.href;
    const loginURL = `${URL_APP}?app_id=${appID}&redirect_url=${redirectURL}`;
    window.location.href = loginURL;
  });
};
