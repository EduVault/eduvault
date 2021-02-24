import Router from 'koa-router';
import websockify from 'koa-websocket';

import Koa from 'koa';
import * as KoaPassport from 'koa-passport';
import password from './password';
import facebook from './facebook';
import google from './google';
import dotwallet from './dotwallet';
import saveOnChain from './saveOnChain';
import checkAuth from '../utils/checkAuth';
import appAuth from './appAuth';
import appManage from './appManage';
import { DefaultState, Context } from 'koa';
import getPerson from '../utils/getPersonFromSession';
import { APP_SECRET } from '../config';
import { utils } from '../utils';
import { clearCollections } from '../utils/clearCollections';
const startRouter = (
  app: websockify.App<Koa.DefaultState, Koa.DefaultContext>,
  passport: typeof KoaPassport,
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
      const person = await (await getPerson(ctx.session.toJSON())).toObject();
      if (!person) ctx.internalServerError('person not found');
      console.log(person);
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
  router.post('/save-thread-id', checkAuth, async (ctx) => {
    const person = await getPerson(ctx.session.toJSON());
    if (!person) ctx.internalServerError('person not found');
    // console.log(person);
    if (person.threadIDStr) ctx.oK({ threadIDStr: person.toObject().threadIDStr, exists: true });
    person.threadIDStr = ctx.request.body.threadIDStr;
    await person.save();
    ctx.oK({ threadIDStr: person.threadIDStr });
  });
  router.post('/upload-db-info', checkAuth, async (ctx) => {
    const person = await getPerson(ctx.session.toJSON());
    if (!person) ctx.internalServerError('person not found');
    // console.log(person);
    if (person.DbInfo) ctx.oK({ DbInfo: person.toObject().DbInfo, exists: true });
    person.DbInfo = ctx.request.body.DbInfo;
    await person.save();
    ctx.oK({ DbInfo: person.DbInfo });
  });
  router.post('/drop-collections', async (ctx) => {
    const appSecret = ctx.request.body.appSecret;
    if (appSecret !== APP_SECRET) ctx.unauthorized();
    else if (!utils.isProdEnv()) {
      await clearCollections();
      ctx.oK();
    } else ctx.methodNotAllowed();
  });

  appManage(router, passport);
  appAuth(router, passport);
  password(router, passport);
  facebook(router, passport);
  google(router, passport);
  dotwallet(router, passport);
  saveOnChain(router);
  app.use(router.routes()).use(router.allowedMethods());
  return router;
};

export default startRouter;
