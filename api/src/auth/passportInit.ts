import passport from 'koa-passport';
import Koa from 'koa';
import session from 'koa-session';
import Person, { IPerson } from '../models/person';
import App, { IApp } from '../models/app';
import { APP_SECRET, SESSION_OPTIONS } from '../config';
import localStrat from './strategies/local';
import devStrat from './strategies/dev';
import googleStrat from './strategies/google';
import facebookStrat from './strategies/facebook';
import dotwalletStrat from './strategies/dotwallet';
import appStrat from './strategies/app';
export default (app: Koa) => {
  /** If we aren't using sessions can comment out this
   * remember to also ad  { session: false } to each passport.authenticate call if you don't want session on that
   */
  app.keys = [APP_SECRET];
  app.use(session(SESSION_OPTIONS, app));
  passport.serializeUser(function (personOrApp: IPerson | IApp, done) {
    if (!personOrApp) done(personOrApp, null);
    // console.log('serializing: ', { personOrApp });
    done(null, personOrApp._id);
  });

  passport.deserializeUser(async function (id, done) {
    const app = await App.findById(id);
    if (app) done(null, app);
    else {
      const person = await Person.findById(id);
      if (person) done(null, person);
      else done(person, null);
    }
  });

  /** Our strategies here: */
  passport.use('password', localStrat);
  passport.use('dev', devStrat);
  passport.use(googleStrat);
  passport.use(facebookStrat);
  passport.use('dotwallet', dotwalletStrat);
  passport.use('app', appStrat);
  /** Boilerplate */
  app.use(passport.initialize());
  app.use(passport.session());
  return passport;
};
