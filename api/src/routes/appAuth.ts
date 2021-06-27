import { IApp } from '../models/app';
import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import { types, AppAndTokenData } from '../types';
import { ROUTES } from '../config';
import { createJwt, getJwtExpiry, compareAppLoginToken } from '../utils/jwt';

/** Accepts appLoginToken and appID. Compares token. Issues JWT and cookie. */
const appAuth = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  router.post(ROUTES.APP_AUTH, async (ctx, next) => {
    const data = ( ctx.request.body as unknown ) as types.AppAuthReq;
    // console.log({ data });
    return passport.authenticate('app', async (error: string, tokenData: AppAndTokenData) => {
      // console.log({ error, tokenData });
      if (error) {
        ctx.unauthorized({ error }, error);
      } else {
        await ctx.login(tokenData);
        const jwt = ctx.session.jwt;
        if (jwt) {
          // decryptToken is part of the login token.
          const now = new Date().getTime();
          const expiry = await getJwtExpiry(jwt);
          if (!expiry) ctx.session.jwt = createJwt(data.appID);
          else if (now - expiry.getTime() < 1000 * 60 * 60 * 24) {
            ctx.session.oldJwt = JSON.parse(JSON.stringify(jwt));
            ctx.session.jwt = createJwt(data.appID);
          }
        } else ctx.session.jwt = createJwt(data.appID);
        await ctx.session.save();
        const returnData: types.AppAuthRes['data'] = {
          jwt: ctx.session.jwt,
          oldJwt: ctx.session.oldJwt,
          decryptToken: tokenData.decryptToken,
        };
        // console.log('login authorized. returnData: ', returnData);
        ctx.oK(returnData);
      }
    })(ctx, next);
  });

  return router;
};
export default appAuth;
