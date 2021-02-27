import Router from 'koa-router';
import websockify from 'koa-websocket';

import Koa from 'koa';
import * as KoaPassport from 'koa-passport';
import password from './password';
import facebook from './facebook';
import google from './google';
import dotwallet from './dotwallet';
import checkAuth from '../utils/checkAuth';
import appAuth from './appAuth';
import appManage from './appManage';
import { DefaultState, Context } from 'koa';
import getPerson from '../utils/getPersonFromSession';
import { APP_SECRET } from '../config';
import { utils } from '../utils';
import { clearCollections } from '../utils/clearCollections';
import { Database } from '@textile/threaddb';
const routerInit = (
  app: websockify.App<Koa.DefaultState, Koa.DefaultContext>,
  passport: typeof KoaPassport,
  db: Database,
) => {
  const router = new Router<DefaultState, Context>();
  router.get('/ping', async (ctx) => {
    console.log('pingged');
    ctx.oK(null, 'pong!');
  });
  /** Get Person and JWT */
  router.get('/get-person', checkAuth, async (ctx) => {
    // console.log('++++++++++++++++++get person+++++++++++++++++++');
    try {
      const person = await getPerson(ctx.session.toJSON(), db);
      if (!person) ctx.internalServerError('person not found');
      // console.log(person);
      ctx.oK(person);
    } catch (error) {
      ctx.internalServerError('person not found');
    }
  });
  router.get('/get-jwt', checkAuth, async (ctx) => {
    ctx.oK({
      jwt: ctx.session.jwt,
      oldJwt: ctx.session.oldJwt ? ctx.session.oldJwt : null,
    });
  });
  router.get('/logout', async (ctx) => {
    ctx.session = null;
    ctx.logout();
    ctx.oK();
  });
  router.get('/auth-check', checkAuth, (ctx) => {
    ctx.oK(null, 'ok');
  });

  router.post('/drop-collections', async (ctx) => {
    const appSecret = ctx.request.body.appSecret;
    if (appSecret !== APP_SECRET) ctx.unauthorized();
    else if (!utils.isProdEnv()) {
      await clearCollections(db);
      ctx.oK();
    } else ctx.methodNotAllowed();
  });

  appManage(router, passport, db);
  appAuth(router, passport);
  password(router, passport, db);
  facebook(router, passport);
  google(router, passport);
  dotwallet(router, passport);
  app.use(router.routes()).use(router.allowedMethods());
  return router;
};

export default routerInit;
