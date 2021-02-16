import { Buffer } from 'buffer';

import {
  CollectionConfig,
  UserAuth as PersonAuth,
  PrivateKey,
  // Client,
} from '@textile/hub';
import { Database, ThreadID } from '@textile/threaddb';

import { WS_API } from '../config';

export const startLocalDB = async (
  collections: CollectionConfig[],
  version = 1,
  onReady?: (db: Database) => any
) => {
  const db = await new Database('eduvault', collections as any).open(version);
  console.log({ db });
  if (onReady) onReady(db);
  return db;
};

export const startRemoteDB = async (
  db: Database,
  threadID: ThreadID,
  jwt: string,
  privateKey: PrivateKey,
  onReady?: (db: Database) => any
) => {
  try {
    console.log({ db, threadID, privateKey });
    const getUserAuth = loginWithChallenge(jwt, privateKey);
    const userAuth = await getUserAuth();
    // console.log({ userAuth });

    /** this is only getting a one-time auth.... */
    const remote = await db.remote.setUserAuth(userAuth);
    /** can test against client */
    // const client = Client.withUserAuth(userAuth);
    // const dbs = await client.listDBs();
    // console.log({ dbs });

    // Grab the token, save it, or just use it
    const token = await remote.authorize(privateKey);
    // save the token encrypted with jwt locally. on refresh, get token with cookie.
    await remote.initialize(threadID);
    console.log({ remote, token });
    remote.config.metadata?.set('x-textile-thread-name', db.dexie.name);
    remote.config.metadata?.set('x-textile-thread', db.id || '');
    if (onReady) onReady(db);
    return { remote, token };
  } catch (error) {
    console.log({ error });
    return error;
  }
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

export function loginWithChallenge(
  jwt: string,
  privateKey: PrivateKey
): () => Promise<PersonAuth> {
  // we pass identity into the function returning function to make it
  // available later in the callback
  return () => {
    return new Promise((resolve, reject) => {
      /** Initialize our websocket connection */
      // console.log('jwt', jwt);
      const socket = new WebSocket(WS_API);
      /** Wait for our socket to open successfully */
      socket.onopen = async () => {
        if (!jwt || jwt === '') throw 'no jwt';
        if (!privateKey) throw 'no privateKey';
        socket.send(
          JSON.stringify({
            type: 'token-request',
            jwt: jwt,
            pubKey: privateKey.public.toString(),
          })
        );

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
