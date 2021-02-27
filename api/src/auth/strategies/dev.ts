import * as passportLocal from 'passport-local';
import { IPerson } from '../../models/person';
import { utils } from '../../utils';
import { Database } from '@textile/threaddb';

const { validPassword } = utils;
const LocalStrategy = passportLocal.Strategy;

const devStrat = (db: Database) => {
  return new LocalStrategy(async (username: string, password: string, done) => {
    try {
      const person = await db.collection<IPerson>('person').findOne({ accountID: username });
      if (!person || !person.accountID) done('error' + person.toJSON(), null);
      else {
        const valid = validPassword(password, person.password);
        const isDev = person.dev && person.dev.isVerified;

        if (valid && isDev) done(null, person.toJSON());
        else done('password does not match', null);
      }
    } catch (error) {
      done(error, null);
    }
  });
};

export default devStrat;
