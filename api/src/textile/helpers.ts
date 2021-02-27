import { createAPISig, Client, UserAuth as PersonAuth, PrivateKey } from '@textile/hub';
import { config, TEXTILE_USER_API_SECRET, SYNC_DEBOUNCE_TIME } from '../config';
import { CollectionConfig } from '@textile/threaddb/dist/cjs/local/collection';

import { Database, JSONSchema } from '@textile/threaddb';
import { appSchema } from '../models/app';
import { personSchema } from '../models/person';
import { debounce } from 'lodash';

const collectionConfigs: CollectionConfig[] = [
  { name: 'app', schema: appSchema },
  { name: 'person', schema: personSchema },
];

export const newLocalDB = async (dbName: string) => {
  try {
    const db = await new Database(dbName, { name: 'app', schema: appSchema });
    await db.collectionConfig({ name: 'person', schema: personSchema });
    await db.open(2);
    // console.log('started local db', { db });
    // const collections = await db.collections();
    // console.log({ collections: collections.keys() });

    return db;
  } catch (error) {
    console.log({ error });
    return { error };
  }
};

const syncChanges = async (db: Database, collectionName: string) => {
  console.log('sync called', new Date());
  if (db.remote && db.remote.id) {
    try {
      await db.remote.createStash();
      const localCollect = await db.collection(collectionName).find({});

      await db.remote.pull();
      const remoteCollect = await db.collection(collectionName).find({});
      console.log({ remoteCollect, localCollect });

      await db.remote.applyStash();
      await db.remote.push();
    } catch (error) {
      return { error };
    }
  } else return { error: 'remote not started' };
};

const debouncedSync = debounce(syncChanges, SYNC_DEBOUNCE_TIME);

export const sync = (db: Database, collectionName: string) => {
  console.log('sync debouncer called', new Date());
  debouncedSync(db, collectionName);
};

const newClientDB = async () => {
  const db = await Client.withKeyInfo({
    key: config.TEXTILE_USER_API_KEY,
    secret: TEXTILE_USER_API_SECRET,
  });
  return db;
};

/** @param seconds (300) time until the sig expires */
const getAPISig = async (seconds: number = 300) => {
  try {
    // await console.log('getting API sig');
    const expiration = await new Date(Date.now() + 1000 * seconds);
    // console.log('API sig expiration', expiration);
    const signature = await createAPISig(config.TEXTILE_USER_API_KEY, expiration);
    return signature;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const localChallengHandler = (id: PrivateKey) => {
  const challengeFunc = async (challenge: Uint8Array): Promise<Uint8Array> => {
    return await id.sign(challenge);
  };
  return challengeFunc;
};

const generatePrivateKey = async (): Promise<PrivateKey> => {
  return await PrivateKey.fromRandom();
};

const generatePersonAuth = async (
  pubkey: string,
  challengeHandler: (challenge: Uint8Array) => Uint8Array | Promise<Uint8Array>,
): Promise<PersonAuth> => {
  const db = await newClientDB();
  const token = await db.getTokenChallenge(pubkey, challengeHandler);
  const signature = await getAPISig();
  return {
    ...signature,
    token: token,
    key: config.TEXTILE_USER_API_KEY,
  } as PersonAuth;
};

const localPersonAuth = async (id: PrivateKey) => {
  return await generatePersonAuth(id.public.toString(), localChallengHandler(id));
};

export {
  newClientDB,
  getAPISig,
  generatePrivateKey,
  localChallengHandler,
  generatePersonAuth,
  localPersonAuth,
};
