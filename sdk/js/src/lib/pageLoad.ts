import { ThreadID } from '@textile/threaddb';
import { URL_APP } from '../config';
import { rehydratePrivateKey, testPrivateKey } from '../utils';
import { getJWT, appLogin } from './APICalls';
// import { ulid } from 'ulid';

import { pageLoadOptions, PageLoadChecksResult } from '../types';

import { utils, isServerConnected } from '../utils';
const { decrypt } = utils;

export async function pageLoadChecks({
  autoRedirect = false,
  redirectURL,
  appID,
  log = false,
}: pageLoadOptions): Promise<PageLoadChecksResult> {
  try {
    const queries = new URL(window.location.href).searchParams;
    // accepts appLoginToken, threadID, pwEncryptedPrivateKey and tokenEncryptedPrivateKey
    // uses appLoginToken to start session and get jwt and decode token.
    // first time uses decode token to decrypt keys.
    // subsequent loadings uses jwtEncryptedPrivateKey from localStorage,
    // then uses cookie to get JWT from server to decrypt
    // in both cases:
    // use jwt to get userAuth
    // userAuth to start DB
    const online = await isServerConnected();
    const threadIDStr = queries.get('thread_id');
    const pwEncryptedPrivateKey = queries.get('pw_encrypted_key_pair');
    const oldPwEncryptedPrivateKey = localStorage.getItem(
      'pwEncryptedPrivateKey'
    );
    const jwtEncryptedPrivateKey = queries.get('jwt_encrypted_key_pair');
    const oldJwtEncryptedPrivateKey = localStorage.getItem(
      'jwtEncryptedPrivateKey'
    );
    const appLoginToken = queries.get('app_login_token');
    const pubKey = queries.get('pubkey');
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
        oldPwEncryptedPrivateKey,
        pwEncryptedPrivateKey,
        jwtEncryptedPrivateKey,
        oldJwtEncryptedPrivateKey,
        appLoginToken,
        pubKey,
      });
    }

    let jwts = null;
    if (online) {
      // coming back to page
      if (jwtEncryptedPrivateKey && !appLoginToken) {
        jwts = await getJWT();
      }
      // coming from login redirect
      else if (appLoginToken && appID) {
        jwts = await appLogin(appLoginToken, appID);
      }
      if (log) console.log({ jwts });
      if (jwtEncryptedPrivateKey && jwts && jwts.jwt && threadID && pubKey) {
        // get jwt
        // try to decrypt
        console.log({ jwtEncryptedPrivateKey, jwts });
        let keyStr = decrypt(jwtEncryptedPrivateKey, jwts.jwt);
        // use oldJWT if it didn't work
        if (!keyStr && jwts.oldJwt)
          keyStr = decrypt(jwtEncryptedPrivateKey, jwts.oldJwt);
        if (!keyStr) {
          return { error: 'unable to decrypt keys' };
        }
        const privateKey = await rehydratePrivateKey(keyStr);
        console.log({ privateKey });

        //should we test the keys better? might require getting ID
        if (privateKey && testPrivateKey(privateKey, pubKey)) {
          return { privateKey, threadID, jwt: jwts.jwt };
        } else {
          return { error: 'login failed' };
        }
      } else {
        return { error: 'login failed' };
      }
    } // coming back, but offline
    else if (pwEncryptedPrivateKey) {
      // create a password input
      console.log('use your password to unlock the database while offline');
      // this mode will only allow local use, can't connect to remote.
      // connect local and connect remote must be separate funcitons
      return { threadID, pwEncryptedPrivateKey };
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
