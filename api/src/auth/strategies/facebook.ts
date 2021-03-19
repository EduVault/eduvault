import { Strategy as FacebookStrategy, Profile as FBProfile } from 'passport-facebook';
import { IPerson } from '../../models/person';
import { FACEBOOK_CONFIG } from '../../config';
import { createSocialMediaAccount } from '../../utils/newSocialMedia';
import { Database } from '@textile/threaddb';
import { v4 as uuid } from 'uuid';

const facebookStrat = (db: Database) => {
  return new FacebookStrategy(FACEBOOK_CONFIG, async (ctx, token, refreshToken, profile, done) => {
    // console.log('===========profile===========\n', profile);
    const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
    const person = await db.collection<IPerson>('person').findOne({
      username: email || profile.id,
    });
    if (person && person.facebook) return done(null, person);
    else
      return createSocialMediaAccount(
        person
          ? person
          : {
              _id: uuid(),
              username: email || profile.id,
            },
        'facebook',
        profile,
        token,
        db,
        done,
      );
  });
};

export default facebookStrat;
