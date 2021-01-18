import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import { ROUTES, CLIENT_CALLBACK } from '../config';
import { IPerson } from '../models/person';
import { createJwt, getJwtExpiry } from '../utils/jwt';

const facebook = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  router.get(
    ROUTES.FACEBOOK_AUTH,
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }),
  );

  router.get(ROUTES.FACEBOOK_AUTH_CALLBACK, async (ctx, next) => {
    return passport.authenticate('facebook', async (err: string, person: IPerson) => {
      if (err) {
        console.log(err);
        ctx.unauthorized(err, err);
      } else {
        // console.log(person.facebook);
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
        ctx.redirect(CLIENT_CALLBACK);
      }
    })(ctx, next);
  });
  return router;
};
export default facebook;
