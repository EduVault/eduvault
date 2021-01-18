import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Person from '../../models/person';
import { GOOGLE_CONFIG } from '../../config';
import { createSocialMediaAccount } from '../../utils/newSocialMedia';

const googleStrat = new GoogleStrategy(
  GOOGLE_CONFIG,
  async (ctx, token, refreshToken, profile, done) => {
    const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
    const person = await Person.findOne({
      accountID: email || profile.id,
    });
    if (person && person.google) return done(null, person);
    else
      return createSocialMediaAccount(
        person ? person : new Person(),
        'google',
        profile,
        token,
        done,
      );
  },
);
export default googleStrat;
