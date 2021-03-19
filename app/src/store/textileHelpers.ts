import { UserAuth as PersonAuth, PrivateKey } from '@textile/hub';
import { AuthState } from '../types';
import { Buffer } from 'buffer';
import { Client, ThreadID, Buckets, Root } from '@textile/hub';
import store from './index';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { fromEvent, Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
// import { DBInfo } from '@textile/threads';

/** we should have different forms of getting the Textile personAuth,
 * 1. crypto wallet: ask crypto wallet to sign
 * 2. oauth: on log in, get the privateKey encrypted by PIN and store in localStorage, challeng person with PIN, and keep the unencrypted privateKey in app storage to keep signing
 * 3. password account: same as 2, but the server is storing only encrypted privateKey, encryped by password. both 2 and 3 need to keep the plaintext public key for recovery
 */
function loginWithChallenge(
  URL_API_ROOT: string,
  jwt: string,
  privateKey: PrivateKey,
): () => Promise<PersonAuth> {
  // we pass identity into the function returning function to make it
  // available later in the callback
  return () => {
    return new Promise((resolve, reject) => {
      /** Initialize our websocket connection */
      // console.log('state.jwt', state.jwt);
      const socket = new WebSocket(URL_API_ROOT);
      /** Wait for our socket to open successfully */
      socket.onopen = async () => {
        if (!jwt || jwt === '') throw 'no jwt';
        if (!privateKey) throw 'no privateKey';
        socket.send(
          JSON.stringify({
            type: 'token-request',
            jwt: jwt,
          }),
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
                }),
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

export async function connectClient(
  URL_API_ROOT: string,
  jwt: string,
  privateKey: PrivateKey,
  threadID: ThreadID,
) {
  async function createClients(
    URL_API_ROOT: string,
    jwt: string,
    privateKey: PrivateKey,
    threadID: ThreadID,
  ) {
    try {
      let start = new Date().getTime();
      const loginCallback = loginWithChallenge(URL_API_ROOT, jwt, privateKey);
      const threadClient = Client.withUserAuth(await loginCallback());
      console.log('Client.withPersonAuth(await loginCallback())\n', new Date().getTime() - start);
      start = new Date().getTime();
      const bucketClient = Buckets.withUserAuth(await loginCallback());
      console.log('Buckets.withPersonAuth(await loginCallback())\n', new Date().getTime() - start);

      return { threadClient, bucketClient };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async function findOrCreateDB(client: Client, threadID: ThreadID) {
    // await client.deleteDB(threadID); // use to delete DB during testing
    try {
      const start = new Date().getTime();
      const threadsList = await client.listThreads();
      console.log('client.listThreads()\n', new Date().getTime() - start);
      // console.log(threadsList);
      if (!threadsList.find((thread) => thread.id === threadID.toString())) throw 'BD not found';
      // const info = await client.getDBInfo(threadID);
      console.log('database found');
    } catch (err) {
      console.log('database not found');
      await client.newDB(threadID, 'EduVault');
      // const afterCheck = await client?.getDBInfo(threadID);
      // console.log('afterCheck', afterCheck);
    }
  }
  // async function createDeckCollection(client: Client, threadID: ThreadID) {
  //   try {
  //     const start = new Date().getTime();
  //     await client.find(threadID, 'Deck', {});
  //     console.log(` client.find(threadID, 'Deck, {})\n`, new Date().getTime() - start);
  //   } catch {
  //     const start = new Date().getTime();
  //     console.log(`no 'Deck' collection found`);
  //     await client.newCollection(threadID, 'Deck', deckSchema);
  //     console.log(
  //       `client.newCollection(threadID, 'Deck', deckSchema)\n`,
  //       new Date().getTime() - start
  //     );
  //   }
  // }
  async function createBuckets(buckets: Buckets, threadID: ThreadID) {
    let start = new Date().getTime();

    const root = await buckets.open('files', 'buckets', false, threadID.toString());
    console.log(
      `buckets.open('files', 'buckets', false, threadID.toString())\n`,
      new Date().getTime() - start,
    );
    // console.log(root);
    if (!root) return null;
    // console.log('creating bucket', buckets);
    await buckets.withThread(threadID.toString());
    start = new Date().getTime();
    const roots = await buckets.list();
    console.log(`buckets.list()\n`, new Date().getTime() - start);
    // console.log('bucket roots', roots);
    const existing = roots.find((root) => root.name === 'files');
    let bucketKey = '';
    if (existing) {
      bucketKey = existing.key;
    } else {
      const created = await buckets.init('files');
      bucketKey = created.root ? created.root.key : '';
    }
    // console.log('bucket key', bucketKey);
    store.commit.authMod.BUCKET_KEY(bucketKey);
    // store.commit.decksMod.BUCKETS(buckets);
    start = new Date().getTime();

    const links = await buckets.links(bucketKey);
    console.log(`buckets.links(bucketKey)\n`, new Date().getTime() - start);

    store.commit.authMod.BUCKET_URL(links.url);
    return bucketKey;
  }
  store.commit.authMod.SYNCING(true);
  // console.log('URL_API_ROOT, jwt, privateKey, threadID', URL_API_ROOT, jwt, privateKey, threadID);
  const start = new Date().getTime();

  const client = await createClients(URL_API_ROOT, jwt, privateKey, threadID);
  if (client && client.threadClient) {
    await findOrCreateDB(client.threadClient, threadID);
    // await createDeckCollection(client.threadClient, threadID);
    await createBuckets(client.bucketClient, threadID);
    console.log('connected to DB. total time:\n', new Date().getTime() - start);
  } else {
    store.commit.authMod.SYNCING(false);
    throw 'error connecting to ThreadDB client';
  }
  store.commit.authMod.SYNCING(false);
  return client.threadClient;
}

// export async function uploadPictureToBucket(file: File) {
//   const start = new Date().getTime();
//   console.log('file size', file.size);
//   const photoId = uuid();
//   const key = store.state.authMod.bucketKey;
//   // const path = await store.state.decksMod.buckets!.pushPath(key!, 'img/' + photoId, file);
//   // console.log('path', path);
//   console.log(`buckets.pushPath(key!, 'img/' + photoId, file)\n`, new Date().getTime() - start);

//   return 'https://gateway.pinata.cloud' + path.path.path;
// }
