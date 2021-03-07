import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import session from 'koa-session';
import util from 'koa-session/lib/util.js';
import { IPerson } from '../models/person';
import { IApp } from '../models/app';
import { DefaultState, Context } from 'koa';
import { types } from '../types';
import { ROUTES, SESSION_OPTIONS } from '../config';
import { createJwt, getJwtExpiry, createAppLoginToken } from '../utils/jwt';
import { utils } from '../utils';
import { v4 as uuid } from 'uuid';
import { Database } from '@textile/threaddb';
import Cookies from 'cookies';
const { hashPassword, validPassword } = utils;
const password = function (
  router: Router<DefaultState, Context>,
  passport: typeof KoaPassport,
  db: Database,
) {
  async function signup(ctx: Context, appLoginToken?: string, decryptToken?: string) {
    const data: types.PasswordLoginReq = ctx.request.body;
    if (!data.pwEncryptedPrivateKey || !data.pubKey || !data.threadIDStr) {
      ctx.unauthorized({ error: 'invalid signup' }, 'invalid signup');
      return;
    }
    const newPerson: IPerson = {
      _id: uuid(),
      accountID: data.accountID,
    };
    newPerson.password = hashPassword(data.password);
    newPerson.pwEncryptedPrivateKey = data.pwEncryptedPrivateKey;
    newPerson.pubKey = data.pubKey;
    newPerson.threadIDStr = data.threadIDStr;
    newPerson.dev = { isVerified: false, apps: [] };
    // console.log('data', data);
    console.log('new person', newPerson);
    await db.collection<IPerson>('person').save(newPerson);
    await ctx.login(newPerson);
    ctx.session.jwt = createJwt(newPerson.accountID);
    await ctx.session.save();

    const returnData: types.PasswordLoginRes['data'] = {
      pwEncryptedPrivateKey: newPerson.pwEncryptedPrivateKey,
      jwt: ctx.session.jwt,
      pubKey: newPerson.pubKey,
      threadIDStr: newPerson.threadIDStr,
    };
    if (appLoginToken && decryptToken) {
      returnData.appLoginToken = appLoginToken;
      returnData.decryptToken = decryptToken;
    }
    // console.log({ returnData });
    ctx.cookies.set('testing', '123');
    const cookies = new Cookies(
      ctx.request as any,
      ctx.response as any,
      {
        secure: true,
        httpOnly: true,
      } as any,
    );
    ctx.res.setHeader('test-header', 'testing');
    cookies.set('koa.sess', 'cookie_payload');
    console.log({
      res: ctx.response.toJSON(),
      req: ctx.request.toJSON(),
      // cookies: ctx.cookies.get('koa.sess'),
      headerCookie: ctx.response.headers['set-cookie'],
    });
    ctx.oK(returnData);
  }

  router.post(ROUTES.PASSWORD_AUTH, async (ctx, next) => {
    const data: types.PasswordLoginReq = ctx.request.body;
    // console.log({ data });
    if (!data.password || !data.accountID) {
      ctx.unauthorized({ error: 'invalid signup' }, 'invalid signup');
      return;
    }
    const appLoginTokens = async () => {
      if (data.redirectURL && data.appID) {
        const decryptToken = uuid();
        return { decryptToken, appLoginToken: await createAppLoginToken(data.appID, decryptToken) };
      } else return { decryptToken: null, appLoginToken: null };
    };
    const { appLoginToken, decryptToken } = await appLoginTokens();
    // console.log({ appLoginToken, decryptToken });
    const person = await db.collection<IPerson>('person').findOne({ accountID: data.accountID });
    // console.log({ person });

    if (!person) return signup(ctx, appLoginToken, decryptToken);
    else {
      return passport.authenticate('password', async (error: string, foundPerson: IPerson) => {
        // strange bug where passport is returning false for the user, but accepting authentication. console logs aren't working within the strategy either
        console.log({ error, foundPerson });
        // so do another check here:
        const valid = validPassword(data.password, person.password);
        // console.log('password check: ', { valid });
        if (error || !valid) {
          ctx.unauthorized(error, error);
        } else {
          await ctx.login(person);
          if (ctx.session.jwt) {
            const now = new Date().getTime();
            const expiry = await getJwtExpiry(ctx.session.jwt);
            if (!expiry) ctx.session.jwt = createJwt(person.accountID);
            else if (now - expiry.getTime() < 1000 * 60 * 60 * 24) {
              ctx.session.oldJwt = JSON.parse(JSON.stringify(ctx.session.jwt));
              ctx.session.jwt = createJwt(person.accountID);
            }
          } else ctx.session.jwt = createJwt(person.accountID);
          ctx.session.save();
          const returnData: types.PasswordLoginRes['data'] = {
            pwEncryptedPrivateKey: person.pwEncryptedPrivateKey,
            jwt: ctx.session.jwt,
            pubKey: person.pubKey,
            threadIDStr: person.threadIDStr,
          };
          if (appLoginToken) {
            returnData.appLoginToken = appLoginToken;
            returnData.decryptToken = decryptToken;
          }
          // console.log({ returnData });
          // console.log({ returnData });
          // ctx.cookies.set('testing', '123');
          const cookies = new Cookies(
            ctx.req as any,
            ctx.res as any,
            {
              secure: true,
              httpOnly: true,
            } as any,
          );
          ctx.res.setHeader('test-header', 'testing');
          ctx.session.save();
          cookies.set('koa.sess', util.encode(ctx.session.toJSON()));

          console.log({
            res: ctx.response.toJSON(),
            req: ctx.request.toJSON(),
            cookies: ctx.cookies.get('koa.sess'),
            headerCookie: ctx.response.headers['set-cookie'],
          });
          ctx.oK(returnData);
        }
      })(ctx, next);
    }
  });
  return router;
};
export default password;
