import websockify from 'koa-websocket';
import {
  setupApp,
  pwAuthTestReq,
  password,
  username,
  appRegisterReq,
  devRegisterReq,
  ROUTES,
} from '../utils/testUtil';
import { Database } from '@textile/threaddb';
import supertest from 'supertest';
import * as http from 'http';

describe(`POST '/dev/verify'`, () => {
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
    app.removeAllListeners();
    server.removeAllListeners();
    server.close();
  });

  it('Can register dev with APP_SECRET', async () => {
    const req = await pwAuthTestReq({ password, username }, agent);
    // console.log({ devPerson });
    const dev = req.body.data;
    // console.log({ dev });
    const verifyRes = await request().post(ROUTES.DEV_VERIFY).send(devRegisterReq);
    // console.log({ verifyRes: verifyRes.body.data });
    expect(verifyRes.body.data.dev.isVerified).toBe(true);
  });
  // it('can handle multiple subsequent requests', async () => {
  //   const req = await pwAuthTestReq({ password, username }, agent);
  //   for (let i = 3; i > 0; i--) {
  //     setTimeout(async function () {
  //       const verifyRes = await request().post(ROUTES.DEV_VERIFY).send(devRegisterReq);

  //       console.log({ verifyRes: verifyRes.body });
  //     }, 300);
  //     var end = Date.now() + 300;
  //     while (Date.now() < end);
  //   }
  // });

  let appID: string;
  it('can register an app', async () => {
    const registerRes = await request().post(ROUTES.APP_REGISTER).send(appRegisterReq);
    // console.log({ registerRes: registerRes.body.data });
    expect(registerRes.body.data.devID).toBe(username);
    appID = registerRes.body.data.appID;
  });
});
