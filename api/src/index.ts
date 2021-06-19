/** Provides nodejs access to a global Websocket value, required by Hub API */
(global as any).WebSocket = require('isomorphic-ws');
import Koa from 'koa';
import cors from '@koa/cors';
import cookie from 'koa-cookie';
import sslify, { xForwardedProtoResolver as resolver } from 'koa-sslify';
import koaResponse from 'koa-response2';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import websockify from 'koa-websocket';
import ip from 'ip';

import { newLocalDB } from './textile/helpers';
import passportInit from './auth/passportInit';
import routerInit from './routes';
import personAuthRoute from './routes/wssPersonAuthRoute';
import { config, CORS_CONFIG, URL_API, URL_APP, PORT_API, APP_SECRET } from './config';
import { isTestEnv, utils } from './utils';
import { clearCollections } from './utils/clearCollections';
import { populateDB } from './utils/populateDB';
// import { appSchema } from './models/app';
// import { personSchema } from './models/person';
const app = websockify(new Koa());
app.proxy = true;
// app.keys = [APP_SECRET];
const { isProdEnv } = utils;

/** Middlewares */
app.use(async function handleGeneralError(ctx, next) {
  try {
    await next();
  } catch (error) {
    console.log(error, error.message);
    ctx.internalServerError(error, error);
  }
});
app.use(cors(CORS_CONFIG));

if (!isTestEnv()) app.use(sslify({ resolver }));
// if (!isTestEnv()) app.use(sslify({ resolver }));
app.use(cookie());
app.use(logger());
app.use(bodyParser());
app.use(helmet());
app.use(
  koaResponse({
    format(status, payload, message = '') {
      return {
        code: status,
        data: payload,
        message,
      };
    },
  }),
);

const testAPI = app;
export { testAPI, newLocalDB, passportInit, routerInit, personAuthRoute };

if (isTestEnv()) {
  /** Start the server! */
  app.listen(PORT_API, async () => {
    // app.ws.listen({ port: PORT_API });
    /** Database */
    const db = await newLocalDB('eduvault-api');
    if ('error' in db) {
      console.log('error loading db');
      return;
    }
    if (!isProdEnv()) {
      await clearCollections(db);
    }
    await populateDB(db);
    // populate with dummy app info

    /** Passport */
    const passport = passportInit(app, db);
    /** Routes */
    routerInit(app, passport, db);
    /** Websockets */
    personAuthRoute(app, db);

    console.log(
      `Koa server listening at ${ip.address()}:${PORT_API} external url ${URL_API} app url ${URL_APP}`,
    );
  });
}
// docker CI testing

export default app;
