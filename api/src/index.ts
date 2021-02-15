/** Provides nodejs access to a global Websocket value, required by Hub API */
(global as any).WebSocket = require('isomorphic-ws');
import mongoose from 'mongoose';
import Koa from 'koa';
import cors from '@koa/cors';
import cookie from 'koa-cookie';
import sslify, { xForwardedProtoResolver } from 'koa-sslify';
import koaResponse from 'koa-response2';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import websockify from 'koa-websocket';
import ip from 'ip';

import connectDB from './mongo/mongoose';
import passportInit from './auth/passportInit';
import startRouter from './routes';
import personAuthRoute from './routes/wssPersonAuthRoute';
import { config, CORS_CONFIG } from './config';
import { utils } from './utils';
const app = websockify(new Koa());

if (utils.isProdEnv()) app.proxy = true;

/** Database */
if (process.env.TEST !== 'true') connectDB();

// delete collections
let del = false;
// let del = true;
if (del)
  try {
    mongoose.connection.collections['person'].drop(function (err: any) {
      console.log('+++++1person collection dropped++++', err);
    });
    mongoose.connection.collections['app'].drop(function (err: any) {
      console.log('+++++1app collection dropped++++', err);
    });
  } catch (error) {
    console.log({ error });
  }

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
if (utils.isProdEnv()) app.use(sslify({ resolver: xForwardedProtoResolver }));
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

/** Passport */
const passport = passportInit(app);

/** Routes */
const router = startRouter(app, passport);
/** Websockets */
personAuthRoute(app);

const testAPI = app;
export { testAPI };

if (process.env.TEST !== 'true')
  /** Start the server! */
  app.listen(config.PORT_API, () =>
    console.log(`Koa server listening at ${ip.address()}:${config.PORT_API}`),
  );

export default app;
