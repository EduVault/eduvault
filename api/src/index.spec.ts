import mongoose from 'mongoose';
import { connectDB, stopDB, request } from './utils/testUtil';
describe('Pingger', () => {
  let db: mongoose.Connection;

  beforeAll(async () => {
    db = await connectDB();
  });

  afterAll(async () => {
    await stopDB(db);
  });
  it('Pings succesffully', async () => {
    const res = await request().get('/ping').send();
    // console.log('ping test result', result);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('pong!');
  });
});
