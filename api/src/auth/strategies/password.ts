import { Database } from '@textile/threaddb';
import * as passportLocal from 'passport-local';
import { IPerson } from '../../models/person';
import { utils } from '../../utils';
const { validPassword } = utils;

const LocalStrategy = passportLocal.Strategy;

const passwordStrat = (db: Database) =>
  new LocalStrategy(async (username: string, password: string, done) => {
    try {
      const person = await db.collection<IPerson>('person').findOne({ username });

      if (!person) {
        done('Person not found', null);
      } else {
        const valid = validPassword(password, person.password);
        if (valid) done(null, person);
        else done('password does not match');
      }
    } catch (error) {
      done(error, null);
    }
  });
export default passwordStrat;
