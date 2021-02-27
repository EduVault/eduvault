import websockify from 'koa-websocket';
import {
  setupApp,
  closeApp,
  pwAuthTestReq,
  password,
  accountID,
  registerApp,
  appAuthWithCookie,
  ROUTES,
} from '../utils/testUtil';
import { types } from '../types';
import { Database } from '@textile/threaddb';
import supertest from 'supertest';
import * as http from 'http';

describe(`POST '/auth/app`, () => {
  let db: Database;
  let request: () => supertest.SuperTest<supertest.Test>;
  let agent: supertest.SuperAgentTest;
  let app: websockify.App;
  let server: http.Server;
  beforeAll(async () => {
    const setup = await setupApp();
    db = setup.db;
    request = setup.request;
    agent = setup.agent;
    app = setup.app;
    server = setup.server;
  });

  afterAll(async () => {
    await closeApp(request, server, app);
  });

  let cookie: string;
  let appID: string;
  it('can authenticate an app from login redirect appLoginToken', async () => {
    appID = await registerApp(agent, request);
    // console.log('registered app ', appID);
    const loginRes = await pwAuthTestReq(
      {
        accountID,
        password,
        appID,
        redirectURL: 'https://somewhere.com',
      },
      agent,
    );
    // console.log({ loginRes: loginRes.body.data });
    expect(typeof loginRes.body.data.appLoginToken).toBe('string');
    expect(loginRes.body.data.appLoginToken.length).toBeGreaterThan(50);
    const appLoginToken = loginRes.body.data.appLoginToken;
    const appAuthReq: types.AppAuthReq = {
      appID,
      appLoginToken,
    };
    const authRes = await request().post(ROUTES.APP_AUTH).send(appAuthReq);
    // console.log({ authRes: authRes.body.data });
    expect(typeof authRes.body.data.jwt).toBe('string');
    expect(typeof authRes.body.data.decryptToken).toBe('string');
    expect(authRes.body.data.decryptToken.length).toBe(36);
    expect(authRes.body.data.jwt.length).toBeGreaterThan(50);
    expect(authRes.headers['set-cookie'][0]).toContain('koa.sess=');
    cookie = authRes.headers['set-cookie'];
  });
  it('Can authenticate app from cookie and return jwts', async () => {
    try {
      const res = await appAuthWithCookie(request().get(ROUTES.GET_JWT), agent, request);
      // console.log('jwts', res.body.data);
      expect(res.status).toEqual(200);
      expect(res.body.code).toEqual(200);
      expect(res.body.data).toHaveProperty('jwt');
      expect(typeof res.body.data.jwt).toBe('string');
      expect(res.body.data.jwt.length).toBeGreaterThan(10);
    } catch (error) {
      console.log({ error });
    }
  });
});
