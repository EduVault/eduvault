import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import { ROUTES, CLIENT_CALLBACK } from '../config';
import { IUser } from '../models/user';
import { createJwt } from '../utils/jwt';

const facebook = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  router.get(
    ROUTES.FACEBOOK_AUTH,
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }),
  );

  router.get(ROUTES.FACEBOOK_AUTH_CALLBACK, async (ctx, next) => {
    return passport.authenticate('facebook', async (err: string, user: IUser) => {
      if (err) {
        console.log(err);
        ctx.unauthorized(err, err);
      } else {
        // console.log(user.facebook);
        await ctx.login(user);
        ctx.session.jwt = createJwt(user.username);
        await ctx.session.save();
        ctx.redirect(CLIENT_CALLBACK);
      }
    })(ctx, next);
  });
  return router;
};
export default facebook;
