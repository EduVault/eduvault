import * as passportLocal from 'passport-local';
import { IPerson } from '../../models/person';
import { utils } from '../../utils';
import { Database } from '@textile/threaddb';

const { validPassword } = utils;
const LocalStrategy = passportLocal.Strategy;

const devStrat = (db: Database) => {
  return new LocalStrategy(async (username: string, password: string, done) => {
    try {
      const person = await db.collection<IPerson>('person').findOne({ username });
      if (!person || !person.username) done('error' + JSON.stringify(person), null);
      else {
        const valid = validPassword(password, person.password);
        const isDev = person.dev && person.dev.isVerified;

        if (valid && isDev) done(null, person);
        else {
          if (!valid) done('password does not match', null);
          if (!isDev) done('developer not verified ');
        }
      }
    } catch (error) {
      done(error, null);
    }
  });
};

export default devStrat;
