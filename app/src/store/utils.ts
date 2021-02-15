import { types, AuthState } from '../types';
// import { orderBy } from 'lodash';
import { utils } from '@eduvault/shared';
export { utils };
import store from './index';
import router from '../router';
import { ThreadID, PrivateKey } from '@textile/hub';

export const formatOutRedirectURL = ({
  redirectURL,
  threadIDStr,
  pwEncryptedPrivateKey,
  encryptedPrivateKey,
  appLoginToken,
  pubKey,
}: {
  redirectURL: string;
  threadIDStr: string;
  pwEncryptedPrivateKey: string;
  encryptedPrivateKey: string;
  appLoginToken: string;
  pubKey: string;
}): string => {
  return (
    redirectURL +
    `?thread_id=${threadIDStr}&pw_encrypted_private_key=${pwEncryptedPrivateKey}&encrypted_private_key=${encryptedPrivateKey}&app_login_token=${appLoginToken}&pub_key=${pubKey}`
  );
};

export async function rehydratePrivateKey(keyStr: string) {
  try {
    return await PrivateKey.fromString(keyStr);
  } catch (error) {
    console.log('rehydratePrivateKey error', error);
    return false;
  }
}

/** Rehydrate keys from string and test if they match the provided public key */
export function testPrivateKey(privateKey: PrivateKey, pubKey: string): boolean {
  const testMatching = privateKey.public.toString() === pubKey;
  const testWorking = privateKey.canSign();
  console.log('key test result: ', testMatching, testWorking);
  if (!testMatching || !testWorking) return false;
  return true;
}

export async function storeNonPersistentAuthData(
  privateKey?: PrivateKey,
  jwt?: string,
  threadID?: ThreadID,
): Promise<void> {
  console.log('storeNonPersistentAuthData', { privateKey, jwt, threadID });

  if (privateKey) store.commit.authMod.PRIVATE_KEY(privateKey);
  if (jwt) store.commit.authMod.JWT(jwt);
  if (threadID) store.commit.authMod.THREAD_ID(threadID);
}

export const storePersistentAuthData = (
  jwtEncryptedPrivateKey?: string,
  pwEncryptedPrivateKey?: string,
  threadIDStr?: string,
  pubKey?: string,
  authType?: AuthState['authType'],
): void => {
  console.log('storePersistentAuthData', {
    jwtEncryptedPrivateKey,
    pwEncryptedPrivateKey,
    threadIDStr,
    pubKey,
    authType,
  });

  if (jwtEncryptedPrivateKey)
    store.commit.authMod.JWT_ENCRYPTED_PRIVATE_KEY(jwtEncryptedPrivateKey);
  if (pwEncryptedPrivateKey) store.commit.authMod.PW_ENCRYPTED_PRIVATE_KEY(pwEncryptedPrivateKey);
  if (threadIDStr) store.commit.authMod.THREAD_ID_STR(threadIDStr);
  if (pubKey) store.commit.authMod.PUBKEY(pubKey);
  if (authType) store.commit.authMod.AUTHTYPE(authType);
};

export function setQueriesForSocialMediaRedirect() {
  localStorage.setItem(
    'queriesForSocialMediaRedirect',
    JSON.stringify({
      redirectURL: router.currentRoute.query.redirect_url,
      appID: router.currentRoute.query.appID,
      time: new Date().getTime(),
    }),
  );
}

export function getQueriesForSocialMediaRedirect() {
  const raw = localStorage.getItem('queriesForSocialMediaRedirect');
  if (!raw) return false;
  const queries: {
    redirectURL: string;
    appID: string;
    time: number;
  } | null = JSON.parse(raw);
  if (!queries) return false;
  else {
    if (!queries.time) return false;
    const now = new Date().getTime();
    // if login happened in the last three minutes
    if (now - queries.time >= 1000 * 60 * 3) return false;
    else return [queries.redirectURL, queries.appID];
  }
}
