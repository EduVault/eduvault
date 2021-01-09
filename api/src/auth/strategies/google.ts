import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/user';
import { GOOGLE_CONFIG } from '../../config';
import { createSocialMediaAccount } from '../../utils/newSocialMedia';

const googleStrat = new GoogleStrategy(
  GOOGLE_CONFIG,
  async (ctx, token, refreshToken, profile, done) => {
    const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
    const user = await User.findOne({
      username: email || profile.id,
    });
    if (user && user.google) return done(null, user);
    else return createSocialMediaAccount(user ? user : new User(), 'google', profile, token, done);
  },
);
export default googleStrat;
