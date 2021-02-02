import { Buffer } from 'buffer';

import { UserAuth as PersonAuth } from '@textile/hub';
import { Database, PrivateKey, ThreadID } from '@textile/threaddb';
import { CollectionConfig } from '@textile/threaddb/dist/esm/local/collection';
import axios, { AxiosRequestConfig } from 'axios';
// import { ulid } from 'ulid';

import { ROUTES, URL_API, URL_APP, WS_API } from '../config';
import { ApiRes, AppAuthReq, AppAuthRes } from '../types';

import { decrypt, isServerConnected } from './utils';

export const startLocalDB = async (
  collections: CollectionConfig[],
  version = 1,
  onReady?: (db: Database) => any
) => {
  const db = await new Database('eduvault', collections as any).open(version);
  if (onReady) onReady(db);
  return db;
};

// use jwt to get userAuth
// userAuth to start DB
export const startRemoteDB = async (
  db: Database,
  threadID: ThreadID,
  jwt: string,
  privateKey: PrivateKey,
  onReady?: (db: Database) => any
) => {
  const remote = await db.remote.setUserAuth(
    loginWithChallenge(jwt, privateKey)
  );
  // Grab the token, save it, or just use it
  const token = await remote.authorize(privateKey);
  // save the token encrypted with jwt locally. on refresh, get token with cookie.
  await remote.initialize(threadID);
  console.log({ remote, token });
  remote.config.metadata?.set('x-textile-thread-name', db.dexie.name);
  remote.config.metadata?.set('x-textile-thread', db.id || '');
  if (onReady) onReady(db);
  return { remote, token };
};

export const syncChanges = async (remote: Database['remote']) => {
  await remote.createStash();
  await remote.pull('Person');
  await remote.applyStash('Person');
  await remote.push('Person');
  // const instances = await db.collection('Person')?.find().sortBy('_id');
  const changes = await remote.pull();
  console.log({ changes });
};

export interface LandingPageAuthOptions {
  autoRedirect?: boolean;
  redirectURL?: string;
  appID?: string;
  log?: boolean;
}

export interface PageLoadChecksResult {
  error?: string;
  threadID?: ThreadID | null;
  pwEncryptedPrivateKey?: string | null;
  privateKey?: PrivateKey;
  jwt?: string;
}

const appLogin = async (appLoginToken: string, appID: string) => {
  try {
    const data: AppAuthReq = { appLoginToken, appID };
    const options: AxiosRequestConfig = {
      url: URL_API + '/auth/app',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
      },
      data,
      method: 'POST',
    };
    const res = await axios(options);
    const resData: ApiRes<AppAuthRes> = res.data;
    console.log('app-login', res.data);
    if (!resData || !resData.data || !resData.data.jwt) return null;
    else return resData.data;
  } catch (error) {
    console.log({ error });
    return null;
  }
};
const getJWT = async () => {
  try {
    const options: AxiosRequestConfig = {
      url: URL_API + ROUTES.GET_JWT,
      withCredentials: true,
      headers: {
        'X-Forwarded-Proto': 'https',
      },
      method: 'GET',
    };
    const res = await axios(options);
    const resData: {
      data: {
        jwt: string;
        oldJwt: string | null;
      };
    } = res.data;
    console.log('get-jwt', res.data);
    if (!resData || !resData.data || !resData.data.jwt) return null;
    else return resData.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
/**
 * Check if keys exist. Optionally
 *
 * ### Example (es module)
 * ```js
 * import { power } from 'typescript-starter'
 * console.log(power(2,3))
 * // => 8
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var power = require('typescript-starter').power;
 * console.log(power(2,3))
 * // => 8
 * ```
 * @param base - the base to exponentiate
 * @param exponent - the power to which to raise the base
 */
export async function pageLoadChecks({
  autoRedirect = false,
  redirectURL,
  appID,
  log = false,
}: LandingPageAuthOptions): Promise<PageLoadChecksResult> {
  try {
    const queries = new URL(window.location.href).searchParams;
    // queries.forEach((val, key) => console.log(key + ': ' + val));
    // accepts appLoginToken, threadID, pwEncryptedPrivateKey and jwtEncryptedPrivateKey
    // uses appLoginToken to start session and get jwt.
    // decrypt keys.
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
    if (log)
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

export async function rehydratePrivateKey(keyStr: string) {
  try {
    return await PrivateKey.fromString(keyStr);
  } catch (error) {
    console.log('rehydratePrivateKey error', error);
    return false;
  }
}

/** Rehydrate keys from string and test if they match the provided public key */
export function testPrivateKey(
  privateKey: PrivateKey,
  pubKey: string
): boolean {
  const testMatching = privateKey.public.toString() === pubKey;
  const testWorking = privateKey.canSign();
  console.log('key test result: ', testMatching, testWorking);
  if (!testMatching || !testWorking) return false;
  return true;
}
export function loginWithChallenge(
  jwt: string,
  privateKey: PrivateKey
): () => Promise<PersonAuth> {
  // we pass identity into the function returning function to make it
  // available later in the callback
  return () => {
    return new Promise((resolve, reject) => {
      /** Initialize our websocket connection */
      // console.log('state.jwt', state.jwt);
      const socket = new WebSocket(WS_API);
      /** Wait for our socket to open successfully */
      socket.onopen = async () => {
        if (!jwt || jwt === '') throw 'no jwt';
        if (!privateKey) throw 'no privateKey';
        socket.send(
          JSON.stringify({
            type: 'token-request',
            jwt: jwt,
          })
        );

        /** Listen for messages from the server */
        socket.onmessage = async (msg) => {
          const data = JSON.parse(msg.data);
          console.log('=================wss message===================', data);

          switch (data.type) {
            case 'error': {
              reject(data.value);
              break;
            }
            /** The server issued a new challenge */
            case 'challenge-request': {
              /** Convert the challenge json to a Buffer */
              const buf = Buffer.from(data.value);
              /** Person our identity to sign the challenge */
              const signed = await privateKey.sign(buf);
              /** Send the signed challenge back to the server */
              socket.send(
                JSON.stringify({
                  type: 'challenge-response',
                  jwt: jwt,
                  signature: Buffer.from(signed).toJSON(),
                })
              );
              break;
            }
            /** New token generated */
            case 'token-response': {
              resolve(data.value);
              break;
            }
          }
        };
      };
    });
  };
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
