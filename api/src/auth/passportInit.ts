import passport from 'koa-passport';
import Koa from 'koa';
import session from 'koa-session';
import { IPerson } from '../models/person';
import { IApp } from '../models/app';
import { APP_SECRET, SESSION_OPTIONS } from '../config';
import passwordStrat from './strategies/password';
import devStrat from './strategies/dev';
import googleStrat from './strategies/google';
import facebookStrat from './strategies/facebook';
// import dotwalletStrat from './strategies/dotwallet';
import appStrat from './strategies/app';
import { Database } from '@textile/threaddb';
export default (app: Koa, db: Database) => {
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
    if (typeof id !== 'string') {
      done('error deserializing, id not string: ' + JSON.stringify(id), null);
      return;
    }
    const app = await db.collection('app').findById(id);
    if (app) done(null, app);
    else {
      const person = await await db.collection('person').findById(id);
      if (person) done(null, person);
      else done(person, null);
    }
  });

  /** Our strategies here: */
  passport.use('password', passwordStrat(db));
  passport.use('dev', devStrat(db));
  passport.use(googleStrat(db));
  passport.use(facebookStrat(db));
  // passport.use('dotwallet', dotwalletStrat, db);
  passport.use('app', appStrat(db));
  /** Boilerplate */
  app.use(passport.initialize());
  app.use(passport.session());
  return passport;
};
