import { types, utils } from '@eduvault/shared';
import supertest from 'supertest';
import { testAPI as app, newLocalDB, passportInit, routerInit, personAuthRoute } from '../index';
import * as http from 'http';
import { ROUTES } from '../config';
export { ROUTES } from '../config';
import { APP_SECRET } from '../config';
import KoaWebsocket from 'koa-websocket';
export const password = 'Password123';
export const username = 'person@email.com';

const { hash } = utils;
const formatPasswordSignIn = utils.formatPasswordSignIn;

export const setupApp = async () => {
  /** Database */
  const db = await newLocalDB('eduvault-test');
  if ('error' in db) {
    console.log('error loading db');
    return;
  }
  app.removeAllListeners();

  /** Passport */
  const passport = passportInit(app, db);
  /** Routes */
  routerInit(app, passport, db);
  /** Websockets */
  personAuthRoute(app, db);
  const server = http.createServer(app.callback());
  const request = () => supertest(server);
  const agent = supertest.agent(server);
  console.log(`Koa test server listening`);
  return { request, agent, db, app, server };
};

export const closeApp = async (
  request: () => supertest.SuperTest<supertest.Test>,
  server: http.Server,
  app: KoaWebsocket.App,
) => {
  try {
    await request().post('/drop-collections').send({ appSecret: APP_SECRET });
    app.removeAllListeners();
    server.removeAllListeners();
    server.close();
  } catch (error) {
    console.log('error closing', { error });
  }
};

export const pwAuthTestReq = async (
  options: {
    username?: string;
    password?: string;
    redirectURL?: string;
    appID?: string;
  },
  agent: supertest.SuperAgentTest,
) => {
  // console.log('pwAuthTestReq', options.appID);
  const personAuthReq = await formatPasswordSignIn(options);
  const res = await agent
    .post(ROUTES.PASSWORD_AUTH)
    .send(personAuthReq)
    .set('Accept', 'application/json');
  return res;
};

export const pwAuthWithCookie = async (req: supertest.Test, agent: supertest.SuperAgentTest) => {
  const res = await pwAuthTestReq({ password, username }, agent);
  const cookie: string = res.headers['set-cookie'];
  req.set('Cookie', cookie);
  return await req;
};

export const devRegisterReq: types.DevVerifyReq = {
  appSecret: APP_SECRET,
  devID: username,
};
export const appRegisterReq: types.AppRegisterReq = {
  username,
  password: hash(password),
  name: 'Awesome New App',
  description: 'An app so cool it defies description',
};

export const registerApp = async (
  agent: supertest.SuperAgentTest,
  request: () => supertest.SuperTest<supertest.Test>,
) => {
  const devPersonSignup = await pwAuthTestReq({ password, username }, agent);
  // console.log({ devPersonSignup: devPersonSignup.body });
  // console.log('devRegisterReq ', devRegisterReq);
  const devVerify = await request().post(ROUTES.DEV_VERIFY).send(devRegisterReq);
  // console.log({ devVerify: devVerify.body });
  console.log({ appRegisterReq });
  const registerRes = await request().post(ROUTES.APP_REGISTER).send(appRegisterReq);
  console.log({ registerRes: registerRes.body });
  const appID: string = registerRes.body.data.appID;
  return appID;
};

export const appUserLogin = async (
  agent: supertest.SuperAgentTest,
  request: () => supertest.SuperTest<supertest.Test>,
) => {
  const appID = await registerApp(agent, request);
  const loginRes = await pwAuthTestReq(
    {
      username,
      password,
      appID,
      redirectURL: 'https://somewhere.com',
    },
    agent,
  );
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

export const appAuthWithCookie = async (
  req: supertest.Test,
  agent: supertest.SuperAgentTest,
  request: () => supertest.SuperTest<supertest.Test>,
) => {
  const cookie: string = await appUserLogin(agent, request);
  req.set('Cookie', cookie);
  return await req;
};
