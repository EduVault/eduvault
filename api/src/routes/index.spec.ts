import { setupApp } from '../utils/testUtil';
import { Database } from '@textile/threaddb';
import supertest from 'supertest';
import websockify from 'koa-websocket';

describe('Pingger', () => {
  let db: Database;
  let request: () => supertest.SuperTest<supertest.Test>;
  let agent: supertest.SuperAgentTest;
  let app: websockify.App;

  beforeAll(async () => {
    const setup = await setupApp();
    db = setup.db;
    request = setup.request;
    agent = setup.agent;
    app = setup.app;
  });

  afterAll(async () => {
    app.removeAllListeners();
  });
  it('Pings successfully', async () => {
    const res = await request().get('/ping').send();
    // console.log('ping test result', result);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('pong!');
  });
});
