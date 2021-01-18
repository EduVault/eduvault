import { Strategy as FacebookStrategy, Profile as FBProfile } from 'passport-facebook';
import Person from '../../models/person';
import { FACEBOOK_CONFIG } from '../../config';
import { createSocialMediaAccount } from '../../utils/newSocialMedia';

const facebookStrat = new FacebookStrategy(
  FACEBOOK_CONFIG,
  async (ctx, token, refreshToken, profile, done) => {
    // console.log('===========profile===========\n', profile);
    const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
    const person = await Person.findOne({
      accountID: email || profile.id,
    });
    if (person && person.facebook) return done(null, person);
    else
      return createSocialMediaAccount(
        person ? person : new Person(),
        'facebook',
        profile,
        token,
        done,
      );
  },
);
export default facebookStrat;
