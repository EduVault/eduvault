import { Strategy as FacebookStrategy, Profile as FBProfile } from 'passport-facebook';
import User from '../../models/user';
import { FACEBOOK_CONFIG } from '../../utils/config';
import { createSocialMediaAccount } from '../../utils/newSocialMedia';

const facebookStrat = new FacebookStrategy(
    FACEBOOK_CONFIG,
    async (ctx, token, refreshToken, profile, done) => {
        // console.log('===========profile===========\n', profile);
        const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
        const user = await User.findOne({
            username: email || profile.id,
        });
        if (user && user.facebook) return done(null, user);
        else
            return createSocialMediaAccount(
                user ? user : new User(),
                'facebook',
                profile,
                token,
                done,
            );
    },
);
export default facebookStrat;
