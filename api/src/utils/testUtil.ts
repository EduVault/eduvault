import mongoose from 'mongoose';
import { types } from '../types';
import { utils } from '../utils';
import supertest from 'supertest';
import { testApp } from '../index';
import * as http from 'http';
import { ROUTES } from '../config';
export { ROUTES } from '../config';
import { APP_SECRET } from '../config';

export const password = 'Password123';
export const accountID = 'person@email.com';

const pwAuthReq = utils.pwAuthReq;

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

export const pwAuthTestReq = async (options: {
  accountID?: string;
  password?: string;
  redirectURL?: string;
  appID?: string;
}) => {
  const personAuthReq = await pwAuthReq(options);
  return await agent.post(ROUTES.LOCAL).send(personAuthReq).set('Accept', 'application/json');
};

export const pwAuthWithCookie = async (req: supertest.Test) => {
  const res = await pwAuthTestReq({ password, accountID });
  const cookie: string = res.headers['set-cookie'];
  req.set('Cookie', cookie);
  return await req;
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
  const db = connectDB(); //reset DB
  await pwAuthReq({ password, accountID });
  await request().post(ROUTES.DEV_VERIFY).send(devRegisterReq);
  const registerRes = await request().post(ROUTES.APP_REGISTER).send(appRegisterReq);
  // console.log({ registerRes: registerRes.body });
  const appID: string = registerRes.body.data.appID;
  return appID;
};
export const appUserLogin = async () => {
  const appID = await registerApp();
  const loginRes = await pwAuthTestReq({
    accountID,
    password,
    appID,
    redirectURL: 'https://somewhere.com',
  });
  const appLoginToken = loginRes.body.data.appLoginToken;
  const appAuthReq: types.AppAuthReq = {
    appID,
    appLoginToken,
  };
  const authRes = await request().post(ROUTES.APP_AUTH).send(appAuthReq);
  // console.log({ authRes: authRes.body });
  const cookie = authRes.headers['set-cookie'];
  // console.log({ cookie });
  return cookie;
};

export const appAuthWithCookie = async (req: supertest.Test) => {
  const cookie: string = await appUserLogin();
  req.set('Cookie', cookie);
  return await req;
};
