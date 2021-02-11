import mongoose from 'mongoose';
import {
  request,
  connectDB,
  stopDB,
  pwAuthReq,
  password,
  accountID,
  appRegisterReq,
  devRegisterReq,
  ROUTES,
} from '../utils/testUtil';

describe(`POST '/dev/verify'`, () => {
  let db: mongoose.Connection;
  beforeAll(async () => {
    db = await connectDB();
  });
  afterAll(async () => {
    await stopDB(db);
  });

  it('Can register dev with APP_SECRET', async () => {
    const devPerson = await pwAuthReq({ password, accountID });
    const dev = devPerson.body.data;
    // console.log({ dev });
    const verifyRes = await request().post(ROUTES.DEV_VERIFY).send(devRegisterReq);
    // console.log({ verifyRes: verifyRes.body.data });
    expect(verifyRes.body.data.dev.isVerified).toBe(true);
  });
  let appID: string;
  it('can register an app', async () => {
    const registerRes = await request().post(ROUTES.APP_REGISTER).send(appRegisterReq);
    console.log({ registerRes: registerRes.body.data });
    expect(registerRes.body.data.devID).toBe(accountID);
    appID = registerRes.body.data.appID;
  });
});
