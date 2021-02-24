import { Buffer } from 'buffer';

import { UserAuth as PersonAuth, PrivateKey } from '@textile/hub';
import { Collection, Database, ThreadID } from '@textile/threaddb';
import { CollectionConfig } from '@textile/threaddb/dist/cjs/local/collection';
import { debounce } from 'lodash';

import { WS_API } from '../config';
import { EduVault } from '../index';

export interface StartLocalDBOptions {
  collectionConfig: CollectionConfig;
  version?: number;
  onStart?: () => any;
  onReady?: (db: Database) => any;
}

export const startLocalDB = async ({
  collectionConfig,
  version = 1,
  onStart,
  onReady,
}: StartLocalDBOptions) => {
  try {
    if (onStart) onStart();
    const db = await new Database('eduvault', collectionConfig);
    await db.open(version);
    console.log('started local db', { db });
    const count = await db.collection('deck')?.count({});
    console.log('count', { count });

    if (onReady) onReady(db);
    return db;
  } catch (error) {
    return { error };
  }
};

export interface StartRemoteDBOptions {
  db: Database;
  threadID: ThreadID;
  jwt: string;
  privateKey: PrivateKey;
  onStart?: () => any;
  onReady?: (db: Database) => any;
}
export const startRemoteDB = async ({
  db,
  threadID,
  jwt,
  privateKey,
  onStart,
  onReady,
}: StartRemoteDBOptions) => {
  try {
    if (onStart) onStart();
    console.log({ db, threadID, privateKey });
    const getUserAuth = loginWithChallenge(jwt, privateKey);
    const userAuth = await getUserAuth();
    // console.log({ userAuth });

    /** this is only getting a one-time auth.... */
    // console.log({ getUserAuth });
    /** can test against client */
    // const client = await Client.withUserAuth(getUserAuth);
    // const threads = await client.listThreads();
    // console.log({ client, threads });
    // const dbs = await client.listDBs();
    // console.log({ dbs });
    const remote = await db.remote.setUserAuth(userAuth);
    console.log({ remote });
    // Grab the token, save it, or just use it
    const token = await remote.authorize(privateKey);
    console.log({ token });
    // save the token encrypted with jwt locally. on refresh, get token with cookie.

    try {
      remote.id = threadID.toString();
      const DBInfo = await remote.info();
      console.log({ DBInfo });
    } catch (error) {
      try {
        console.log({ DBInfoError: error });

        await remote.initialize(threadID);
      } catch (error) {
        remote.id = threadID.toString();
        console.log({ initializeError: error });
      }
    }
    try {
      const DBInfo = await remote.info();
      console.log({ DBInfo });
    } catch (error) {
      console.log({ DBInfoError: error });
    }

    console.log({ remote, token });
    remote.config.metadata?.set('x-textile-thread-name', db.dexie.name);
    remote.config.metadata?.set('x-textile-thread', db.id || '');
    if (onReady) onReady(db);
    return { db, remote, token };
  } catch (error) {
    console.log({ error });
    return { error };
  }
};

export const sync = (self: EduVault) => {
  return async (collectionName: Collection['name'], debounceTime = 500) => {
    console.log('debouncing', {
      syncSave: collectionName,
      remote: !!self.db?.remote,
      online: await self.isOnline(),
    });
    if (!!self.db?.remote && (await self.isOnline())) {
      const syncToRemote = async () => {
        console.log('saving changes remotely');
        const changes = await self.syncChanges(collectionName);
        if ('error' in changes) return changes;
        else {
          self.backlog = undefined;
          return changes.remoteChanges;
        }
      };
      const debouncedSync = debounce(syncToRemote, debounceTime);
      return debouncedSync();
    } else {
      console.log('adding to backlog');
      self.backlog = collectionName;
      self.checkConnectivityClearBacklog();
      return { error: 'offline' };
    }
  };
};

export const syncChanges = (self: EduVault) => {
  return async (collectionName: string) => {
    try {
      console.log('syncing changes to remote', { remote: self.db?.remote });
      const remote = self.db?.remote;
      if (!remote) throw 'no remote found';
      await remote.createStash();
      const remoteChanges = await remote.pull(collectionName);
      console.log({ remoteChanges });
      await remote.applyStash(collectionName);
      await remote.push(collectionName);
      return { remoteChanges };
    } catch (error) {
      return { error };
    }
  };
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
        if (!jwt || jwt === '') throw { error: 'no jwt' };
        if (!privateKey) throw { error: 'no privateKey' };
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
              console.log('wss error', data);
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

export const startRemoteWrapped = (self: EduVault) => {
  return async (options: StartRemoteDBOptions) => {
    const remoteStart = await startRemoteDB(options);
    if ('error' in remoteStart) return { error: remoteStart.error };
    else {
      self.remoteToken = remoteStart.token;
      self.db = remoteStart.db;
      return self.db;
    }
  };
};
export const startLocalWrapped = (self: EduVault) => {
  return async (options: StartLocalDBOptions) => {
    const db = await startLocalDB(options);
    if ('error' in db) return { error: db.error };
    else {
      self.db = db;
      return db;
    }
  };
};
