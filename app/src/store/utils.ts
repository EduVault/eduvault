import { IPerson, AuthState } from '../types';
// import { orderBy } from 'lodash';
import CryptoJS from 'crypto-js';
import store from './index';
import { ThreadID, PrivateKey } from '@textile/hub';

export function encrypt(content: string, encryptKey: string) {
  console.log('encrypting', { content, encryptKey });
  const encrypted = CryptoJS.AES.encrypt(content, encryptKey).toString();
  console.log({ encrypted });
  return encrypted;
}

export function decrypt(content: string, decryptKey: string) {
  console.log('decrypting', { content, decryptKey });
  try {
    const decrypted = CryptoJS.AES.decrypt(content, decryptKey).toString(CryptoJS.enc.Utf8);
    console.log({ decrypted });
    return decrypted;
  } catch (error) {
    console.log('decryption error', error);
    return false;
  }
}
export function encryptionSanityCheck(str: string) {
  const encypted = encrypt(str, 'password');
  const decrypted = decrypt(encypted, 'password');
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
export function testKeyPair(keyPair: PrivateKey, pubKey: string): boolean {
  const testMatching = keyPair.public.toString() === pubKey;
  const testWorking = keyPair.canSign();
  console.log('key test result: ', testMatching, testWorking);
  if (!testMatching || !testWorking) return false;
  return true;
}

export async function storeNonPersistentAuthData(
  keyPair?: PrivateKey,
  jwt?: string,
  threadID?: ThreadID,
): Promise<void> {
  console.log('storeNonPersistentAuthData', { keyPair, jwt, threadID });

  if (keyPair) store.commit.authMod.KEYPAIR(keyPair);
  if (jwt) store.commit.authMod.JWT(jwt);
  if (threadID) store.commit.authMod.THREAD_ID(threadID);
}

export const storePersistentAuthData = (
  jwtEncryptedKeyPair?: string,
  pwEncryptedKeyPair?: string,
  threadIDStr?: string,
  pubKey?: string,
  authType?: AuthState['authType'],
): void => {
  console.log('storePersistentAuthData', {
    jwtEncryptedKeyPair,
    pwEncryptedKeyPair,
    threadIDStr,
    pubKey,
    authType,
  });

  if (jwtEncryptedKeyPair) store.commit.authMod.JWT_ENCRYPTED_KEYPAIR(jwtEncryptedKeyPair);
  if (pwEncryptedKeyPair) store.commit.authMod.PW_ENCRYPTED_KEYPAIR(pwEncryptedKeyPair);
  if (threadIDStr) store.commit.authMod.THREAD_ID_STR(threadIDStr);
  if (pubKey) store.commit.authMod.PUBKEY(pubKey);
  if (authType) store.commit.authMod.AUTHTYPE(authType);
};
