import { Deck, User } from '../types';
import { orderBy } from 'lodash';
import CryptoJS from 'crypto-js';
import store from './index';
import { ThreadID, PrivateKey } from '@textile/hub';

/** Combine the backlog and the current list of decks to be added. Return only the newest editions.
 * @param decksRaw the most recent list of decks being added to the thread
 * @param backlog the previous backlog
 */
export function combineBacklog(decksRaw: Deck[], backlog: Deck[]) {
  console.log('combineBacklog', decksRaw, backlog);
  const combined = decksRaw.concat(backlog);
  console.log('combined', combined);
  const ordered = orderBy(combined, ['updatedAt', 'desc']);
  console.log(ordered);
  const pruned: Deck[] = [];
  ordered.forEach((deck) => {
    const prunedIDs = pruned.map((deck) => deck._id);
    if (!prunedIDs.includes(deck._id)) pruned.push(deck);
  });
  console.log('pruned', pruned);
  return pruned;
}

export async function rehydrateKeyPair(
  encryptedKeyPair: string,
  pubKey: string,
  decrpyter: string,
) {
  const decryptedKeyPairBytes = CryptoJS.AES.decrypt(encryptedKeyPair, decrpyter);
  const decryptedKeyPairString = decryptedKeyPairBytes.toString(CryptoJS.enc.Utf8);
  const rehydratedKeyPair = await PrivateKey.fromString(decryptedKeyPairString);
  const testMatching = rehydratedKeyPair.public.toString() === pubKey;
  // console.log('keys match: ', testMatching);
  if (!testMatching) throw 'Unable to decrypt keys from server';
  return rehydratedKeyPair;
}

export async function saveLoginData(loginData: any, password: string) {
  const rehydratedKeyPair = await rehydrateKeyPair(
    loginData.encryptedKeyPair,
    loginData.pubKey,
    password,
  );
  if (store.state.authMod.threadIDStr !== loginData.threadIDStr)
    store.commit.authMod.THREAD_ID_STR(loginData.threadIDStr);
  const threadID = ThreadID.fromString(loginData.threadIDStr);
  if (store.state.authMod.keyPair !== rehydratedKeyPair)
    await store.commit.authMod.KEYPAIR(rehydratedKeyPair);
  if (store.state.authMod.jwt !== loginData.jwt) await store.commit.authMod.JWT(loginData.jwt);
  if (store.state.authMod.threadID !== threadID) await store.commit.authMod.THREAD_ID(threadID);
  await store.commit.authMod.AUTHTYPE('password');
  const jwtEncryptedKeyPair = CryptoJS.AES.encrypt(
    rehydratedKeyPair.toString(),
    loginData.jwt,
  ).toString();
  if (store.state.authMod.jwtEncryptedKeyPair !== jwtEncryptedKeyPair)
    await store.commit.authMod.JWT_ENCRYPTED_KEYPAIR(jwtEncryptedKeyPair);
  if (store.state.authMod.pubKey !== loginData.pubKey)
    await store.commit.authMod.PUBKEY(loginData.pubKey);
}
export async function passwordRehydrate(
  jwtEncryptedKeyPair: string | undefined,
  pubKey: string | undefined,
  threadIDStr: string | undefined,
  stateJwt: string | undefined,
): Promise<boolean> {
  if (!jwtEncryptedKeyPair || !pubKey || !threadIDStr) {
    store.commit.authMod.LOGGEDIN(false);
    console.log('couldnt find keys stored in local storage');
    return false;
  } else {
    // If we refreshed the page and don't have a jwt, we'll need to request a new one
    let jwt;
    if (!stateJwt) {
      const user = await store.dispatch.authMod.getUser();
      jwt = user.jwt;
    } else {
      jwt = stateJwt;
    }
    if (!jwt) {
      // if that failed, we'll need to login
      store.commit.authMod.LOGGEDIN(false);
      console.log('invalid jwt');
      return false;
    }
    // if we have all the info we need, rehydrate them and start back up the DB connection.
    const threadID = ThreadID.fromString(threadIDStr);
    const rehydratedKeyPair = await rehydrateKeyPair(jwtEncryptedKeyPair, pubKey, jwt);
    await store.commit.authMod.KEYPAIR(rehydratedKeyPair);
    await store.commit.authMod.JWT(jwt);
    await store.commit.authMod.THREAD_ID(threadID);

    await store.commit.authMod.LOGGEDIN(true);
    return true;
  }
}

export async function socialMediaRehydrate(
  jwtEncryptedKeyPair: string | undefined,
  pubKey: string | undefined,
  threadIDStr: string | undefined,
  stateJwt: string | undefined,
  authType: 'google' | 'facebook' | 'dotwallet',
): Promise<boolean> {
  let jwt = stateJwt;
  // console.log('stateJwt', stateJwt);
  if (jwt && jwtEncryptedKeyPair && threadIDStr && pubKey) {
    // check if we have jwtEncryptedKeyPair and threadIDStr and pubKey try to resolve from that
    const threadID = ThreadID.fromString(threadIDStr);
    const rehydratedKeyPair = await rehydrateKeyPair(jwtEncryptedKeyPair, pubKey, jwt);
    await store.commit.authMod.KEYPAIR(rehydratedKeyPair);
    await store.commit.authMod.THREAD_ID(threadID);
    await store.commit.authMod.LOGGEDIN(true);
    return true;
  } else {
    const user: User = await store.dispatch.authMod.getUser();
    // console.log('user', user);
    const socialMediaKeyPair = user.socialMediaKeyPair;
    const socialMediaID =
      authType === 'google' || authType === 'facebook'
        ? user[authType]?.id
        : user.dotwallet?.user_open_id;
    const threadIDStr = user.threadIDStr;
    const pubKey = user.pubKey;
    jwt = user.jwt;
    if (jwt && threadIDStr && socialMediaKeyPair && socialMediaID && pubKey) {
      const threadID = ThreadID.fromString(threadIDStr);
      const rehydratedKeyPair = await rehydrateKeyPair(socialMediaKeyPair, pubKey, socialMediaID);
      // console.log('rehydratedKeyPair', rehydratedKeyPair);
      await store.commit.authMod.KEYPAIR(rehydratedKeyPair);
      await store.commit.authMod.THREAD_ID(threadID);
      await store.commit.authMod.JWT(jwt);
      await store.commit.authMod.THREAD_ID_STR(threadIDStr);
      const jwtEncryptedKeyPair = CryptoJS.AES.encrypt(
        rehydratedKeyPair.toString(),
        jwt,
      ).toString();
      await store.commit.authMod.JWT_ENCRYPTED_KEYPAIR(jwtEncryptedKeyPair);
      await store.commit.authMod.PUBKEY(pubKey);
      await store.commit.authMod.LOGGEDIN(true);
      return true;
    } else {
      // if that failed, we'll need to login
      store.commit.authMod.LOGGEDIN(false);
      console.log('invalid jwt');
      return false;
    }
  }

  // if we don't, get the user, then use their socialMediaID, and socialMediaKeyPair to decrypt. set threadIDStr and threadID
}
