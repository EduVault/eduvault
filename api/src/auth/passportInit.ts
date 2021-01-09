import passport from 'koa-passport';
import Koa from 'koa';
import session from 'koa-session';
import User, { IUser } from '../models/user';
import { APP_SECRET, SESSION_OPTIONS } from '../config';
import localStrat from './strategies/local';
import googleStrat from './strategies/google';
import facebookStrat from './strategies/facebook';
import dotwalletStrat from './strategies/dotwallet';

export default (app: Koa) => {
  /** If we aren't using sessions can comment out this
   * remember to also ad  { session: false } to each passport.authenticate call if you don't want session on that
   */
  app.keys = [APP_SECRET];
  app.use(session(SESSION_OPTIONS, app));
  passport.serializeUser(function (user: IUser, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err: any, user: IUser) {
      done(err, user);
    });
  });

  /** Our strategies here: */
  passport.use(localStrat);
  passport.use(googleStrat);
  passport.use(facebookStrat);
  passport.use('dotwallet', dotwalletStrat);
  /** Boilerplate */
  app.use(passport.initialize());
  app.use(passport.session());
  return passport;
};
