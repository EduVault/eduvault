import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import Person, { IPerson } from '../models/person';
import App, { IApp } from '../models/app';
import { DefaultState, Context } from 'koa';
import { types } from '../types';
import { ROUTES } from '../config';
import { createJwt, getJwtExpiry, createAppLoginToken } from '../utils/jwt';
import { utils } from '../utils';
import { v4 as uuid } from 'uuid';
const { hashPassword, validPassword } = utils;
const local = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  async function signup(ctx: Context, appLoginToken?: string, decryptToken?: string) {
    const data: types.PasswordLoginReq = ctx.request.body;
    if (!data.pwEncryptedPrivateKey || !data.pubKey || !data.threadIDStr) {
      ctx.unauthorized({ error: 'invalid signup' }, 'invalid signup');
      return;
    }
    const newPerson = new Person();
    newPerson.accountID = data.accountID;
    newPerson.password = hashPassword(data.password);
    newPerson.pwEncryptedPrivateKey = data.pwEncryptedPrivateKey;
    newPerson.pubKey = data.pubKey;
    newPerson.threadIDStr = data.threadIDStr;
    newPerson.dev = { isVerified: false, apps: [] };
    // console.log('data', data);
    // console.log('new person', newPerson.toJSON());
    newPerson.save();
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
    ctx.oK(returnData);
  }

  router.post(ROUTES.LOCAL_AUTH, async (ctx, next) => {
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
    const person = await Person.findOne({ accountID: data.accountID });
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
          await ctx.session.save();
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
          ctx.oK(returnData);
        }
      })(ctx, next);
    }
  });
  return router;
};
export default local;
