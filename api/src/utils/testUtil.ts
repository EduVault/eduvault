import mongoose from 'mongoose';
import { types } from '../types';
import { ThreadID, PrivateKey } from '@textile/hub';
import { encrypt, hash } from '../utils/encryption';
import supertest from 'supertest';
import { testApp } from '../index';
import * as http from 'http';
import { ROUTES } from '../config';
export { ROUTES } from '../config';
import { APP_SECRET } from '../config';

export const password = 'Password123';
export const accountID = 'person@email.com';

export const request = () => supertest(http.createServer(testApp.callback()));
export const agent = supertest.agent(http.createServer(testApp.callback()));

export const connectDB = async () => {
  try {
    // console.log('connecting');
    const db = mongoose.connection;
    //@ts-ignore
    mongoose.connect(global.__MONGO_URI__, {
      //@ts-ignore
      dbName: global.__MONGO_DB_NAME__,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db.on('error', (err) => {
      throw new Error(err);
    });
    // db.on('connected', () => console.log('connected to mongo'));
    // db.on('diconnected', () => console.log('Mongo is disconnected'));
    // db.on('open', () => console.log('Connection Made!'));

    try {
      await db.dropCollection('person');
      await db.dropCollection('app');
    } catch (error) {
      // console.log({ error });
    }
    return db;
  } catch (connectionError) {
    console.log({ connectionError });
  }
};
//
export const stopDB = async (db: mongoose.Connection) => {
  try {
    await db.dropCollection('person');
    await db.dropCollection('app');
  } catch (error) {
    // console.log({ error });
  }
  await db.close();
};

export const devRegisterReq: types.DevVerifyReq = {
  appSecret: APP_SECRET,
  devID: accountID,
};
export const appRegisterReq: types.AppRegisterReq = {
  accountID,
  password,
  name: 'Awesome New App',
  description: 'An app so cool it defies description',
};

export const registerApp = async () => {
  await pwAuthReq({ password, accountID });
  await request().post(ROUTES.DEV_VERIFY).send(devRegisterReq);
  const registerRes = await request().post(ROUTES.APP_REGISTER).send(appRegisterReq);
  const appID: string = registerRes.body.data.appID;
  return appID;
};

export const pwAuthReq = async (options: {
  accountID?: string;
  password?: string;
  redirectURL?: string;
  appID?: string;
}) => {
  const privateKey = await PrivateKey.fromRandom();
  const pubKey = await privateKey.public.toString();
  const newThreadID = await ThreadID.fromRandom();
  const threadIDStr = newThreadID.toString();
  const newPersonReq: types.PasswordLoginReq = {
    accountID: options.accountID,
    password: options.password ? hash(options.password) : null,
    pwEncryptedPrivateKey: encrypt(privateKey.toString(), password),
    threadIDStr,
    pubKey,
    redirectURL: options.redirectURL,
    appID: options.appID,
  };
  return await agent.post(ROUTES.LOCAL).send(newPersonReq).set('Accept', 'application/json');
};

export const withCookie = async (req: supertest.Test) => {
  const res = await pwAuthReq({ password, accountID });
  const cookie: string = res.headers['set-cookie'];
  req.set('Cookie', cookie);
  return await req;
};
