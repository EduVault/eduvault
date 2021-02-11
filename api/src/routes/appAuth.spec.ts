import mongoose from 'mongoose';
import {
  request,
  connectDB,
  stopDB,
  pwAuthReq,
  password,
  accountID,
  registerApp,
  appAuthWithCookie,
  ROUTES,
} from '../utils/testUtil';
import { types } from '../types';

describe(`POST '/auth/app`, () => {
  let db: mongoose.Connection;
  beforeAll(async () => {
    db = await connectDB();
  });
  afterAll(async () => {
    await stopDB(db);
  });
  let cookie: string;
  let appID: string;
  it('can authenticate an app from login redirect appLoginToken', async () => {
    appID = await registerApp();
    const loginRes = await pwAuthReq({
      accountID,
      password,
      appID,
      redirectURL: 'https://somewhere.com',
    });
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
    const res = await appAuthWithCookie(request().get(ROUTES.GET_JWT));
    // console.log('jwts', res.body.data);
    expect(res.status).toEqual(200);
    expect(res.body.code).toEqual(200);
    expect(res.body.data).toHaveProperty('jwt');
    expect(typeof res.body.data.jwt).toBe('string');
    expect(res.body.data.jwt.length).toBeGreaterThan(10);
  });
});
