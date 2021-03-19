import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { IPerson } from '../models/person';
import { DefaultState, Context } from 'koa';
import { ROUTES, CLIENT_CALLBACK } from '../config';
import { createJwt, getJwtExpiry } from '../utils/jwt';

const google = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  router.get(ROUTES.GOOGLE_AUTH, passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(ROUTES.GOOGLE_AUTH_CALLBACK, async (ctx, next) => {
    return passport.authenticate('google', async (err: string, person: IPerson) => {
      if (err) {
        ctx.unauthorized(err, err);
      } else {
        ctx.login(person);
        if (ctx.session.jwt) {
          const now = new Date().getTime();
          const expiry = await getJwtExpiry(ctx.session.jwt);
          if (!expiry) ctx.session.jwt = createJwt(person.username);
          else if (now - expiry.getTime() < 1000 * 60 * 60 * 24) {
            ctx.session.oldJwt = JSON.parse(JSON.stringify(ctx.session.jwt));
            ctx.session.jwt = createJwt(person.username);
          }
        } else ctx.session.jwt = createJwt(person.username);
        await ctx.session.save();
        ctx.redirect(CLIENT_CALLBACK);
      }
    })(ctx, next);
  });
  return router;
};
export default google;
