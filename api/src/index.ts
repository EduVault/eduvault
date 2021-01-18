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

import connectDb from './mongo/mongoose';
import passportInit from './auth/passportInit';
import startRouter from './routes';
import personAuthRoute from './routes/wssPersonAuthRoute';
import { PORT, CORS_CONFIG } from './config';

const app = websockify(new Koa());

if (process.env.NODE_ENV === 'production') app.proxy = true;

/** Database */
const db = connectDb();

// delete person collection
// mongoose.connection.collections['person'].drop(function (err: any) {
//   console.log('+++++collection dropped++++');
// });

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
if (process.env.NODE_ENV === 'production') app.use(sslify({ resolver: xForwardedProtoResolver }));
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
/** Start the server! */
app.listen(PORT, () => console.log(`Koa server listening at ${ip.address()}:${PORT}`));

export default app;
