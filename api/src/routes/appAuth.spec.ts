import mongoose from 'mongoose';
import {
  request,
  connectDB,
  stopDB,
  pwAuthReq,
  password,
  accountID,
  registerApp,
  ROUTES,
} from '../utils/testUtil';
import { types } from '../types';

export const appAuth = describe(`POST '/auth/app`, () => {
  let db: mongoose.Connection;
  beforeAll(async () => {
    db = await connectDB();
  });
  afterAll(async () => {
    await stopDB(db);
  });

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
    console.log({ authRes: authRes.body.data });
  });
});
