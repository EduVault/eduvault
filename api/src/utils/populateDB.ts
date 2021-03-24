import { utils } from './index';
import { v4 as uuid } from 'uuid';
import { Database } from '@textile/threaddb';
import { IPerson } from '../models/person';
import { IApp } from '../models/app';
import { ThreadID, PrivateKey } from '@textile/hub';
const { hashPassword, encrypt, hash } = utils;

const password = 'Password123';
const username = 'person@email.com';
const appID = '123';

/** formats a new person. Creates new keys and thread id */
export const formatNewPerson = async (options: {
  username?: string;
  password?: string;
}): Promise<IPerson> => {
  const privateKey = await PrivateKey.fromRandom();
  const pubKey = await privateKey.public.toString();
  const newThreadID = await ThreadID.fromRandom();
  const threadIDStr = newThreadID.toString();
  const hashed = hash(options.password);
  // console.log({ hashed, doubleHashed: hashPassword(hashed) });
  const person = {
    _id: uuid(),
    username: options.username,
    password: hashPassword(hashed),
    pwEncryptedPrivateKey: encrypt(privateKey.toString(), options.password),
    threadIDStr,
    pubKey,
    dev: { isVerified: true, apps: [appID] },
  };

  return person;
};

export const formatNewApp = (devID: string) => {
  const app: IApp = {
    _id: uuid(),
    appID,
    devID,
    description: 'A default testing app',
    name: 'Awesome App',
  };
  return app;
};

export const populateDB = async (db: Database) => {
  const newPerson = await formatNewPerson({ username, password });
  await db.collection<IPerson>('person').save(newPerson);
  const newApp = formatNewApp(username);
  await db.collection<IApp>('app').save(newApp);
};
