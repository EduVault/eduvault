import * as passportLocal from 'passport-local';
import Person, { IPerson } from '../../models/person';
import { validPassword } from '../../utils/encryption';

const LocalStrategy = passportLocal.Strategy;

const localStrat = new LocalStrategy(async (username: string, password: string, done) => {
  try {
    Person.findOne({ accountID: username }, undefined, undefined, (error, person) => {
      if (error) done(error);
      else if (!person) {
        done('Person not found');
      } else {
        const valid = validPassword(password, person.password);
        const isDev = person.dev && person.dev.isVerified;
        if (valid && isDev) done('success', person);
        else done('password does not match');
      }
    });
  } catch (error) {
    done(error);
  }
});
export default localStrat;
