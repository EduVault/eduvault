import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import { ROUTES, CLIENT_CALLBACK } from '../config';
import { IUser } from '../models/user';
import { createJwt } from '../utils/jwt';

const dotwallet = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  router.get(ROUTES.DOTWALLET_AUTH, async (ctx, next) => {
    return passport.authenticate('dotwallet', async (err: string, user: IUser) => {
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
export default dotwallet;
