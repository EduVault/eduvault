import * as passportLocal from 'passport-local';
import Person, { IPerson } from '../../models/person';
import { utils } from '../../utils';
const { validPassword } = utils;

const LocalStrategy = passportLocal.Strategy;

const passwordStrat = new LocalStrategy(async (username: string, password: string, done) => {
  try {
    console.log('localstrat', { username, password });
    Person.findOne({ accountID: username }, undefined, undefined, (error, person) => {
      console.log('localStrat', { error, person });
      if (error) done(error);
      else if (!person) {
        done('Person not found');
      } else {
        const valid = validPassword(password, person.password);
        if (valid) done(null, person);
        else done('password does not match');
      }
    });
  } catch (error) {
    done(error);
  }
});
export default passwordStrat;
