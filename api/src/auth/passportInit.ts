import passport from 'koa-passport';
import Koa from 'koa';
import session from 'koa-session';
import Person, { IPerson } from '../models/person';
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
  passport.serializeUser(function (person: IPerson, done) {
    done(null, person._id);
  });

  passport.deserializeUser(function (id, done) {
    Person.findById(id, function (err: any, person: IPerson) {
      done(err, person);
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
