import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { IPerson } from '../../models/person';
import { GOOGLE_CONFIG } from '../../config';
import { createSocialMediaAccount } from '../../utils/newSocialMedia';
import { Database } from '@textile/threaddb';
import { v4 as uuid } from 'uuid';

const googleStrat = (db: Database) =>
  new GoogleStrategy(GOOGLE_CONFIG, async (ctx, token, refreshToken, profile, done) => {
    const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
    const person = await db.collection<IPerson>('person').findOne({
      username: email || profile.id,
    });
    if (person && person.google) return done(null, person);
    else
      return createSocialMediaAccount(
        person
          ? person
          : {
              _id: uuid(),
              username: email || profile.id,
            },
        'google',
        profile,
        token,
        db,
        done,
      );
  });
export default googleStrat;
