import * as passportLocal from 'passport-local';
import Person, { IPerson } from '../models/person';
import * as bcrypt from 'bcryptjs';

const LocalStrategy = passportLocal.Strategy;

const localStrat = new LocalStrategy(
  async (accountID: IPerson['accountID'], password: IPerson['password'], done) => {
    const person = await Person.findOne({ accountID: accountID });
    if (!person) {
      done('Personon not found', false);
    } else {
      bcrypt.compare(password, person.password, (error, result) => {
        if (error) {
          done(error, false);
        } else if (result) {
          done(null, person);
        } else {
          done('Password does not match', false);
        }
      });
    }
  },
);
export default localStrat;
