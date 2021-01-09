import { Strategy as CustomStrategy } from 'passport-custom';
import axios from 'axios';
import User from '../../models/user';
import { DOTWALLET_APP_ID, DOTWALLET_SECRET } from '../../config';
import { createDotwalletAccount } from '../../utils/newSocialMedia';
import url from 'url';
import { DotwalletAccessData, DotwalletProfile } from '../../types';
const dotwalletStrat = new CustomStrategy(async (ctx, done) => {
  try {
    const code = ctx.query.code;
    console.log('==============got code==============\n', code);
    const data = {
      app_id: DOTWALLET_APP_ID,
      secret: DOTWALLET_SECRET,
      code: code,
    };
    console.log('==============data==============\n', data);

    const accessTokenRequest = await axios.post(
      'https://www.ddpurse.com/platform/openapi/access_token',
      data,
    );
    console.log('==============access token result==============\n', accessTokenRequest);
    const accessData: DotwalletAccessData = accessTokenRequest.data.data;
    const accessToken = accessData.access_token;
    if (accessToken) {
      const userInfoRequest = await axios.get(
        'https://www.ddpurse.com/platform/openapi/get_user_info?access_token=' + accessToken,
      );
      console.log('==============user info result==============\n', userInfoRequest.data);
      const profile: DotwalletProfile = userInfoRequest.data.data;
      const id = profile.user_open_id;
      const user = await User.findOne({ username: id });
      if (user && user.dotwallet) return done(null, user);
      else return createDotwalletAccount(user ? user : new User(), profile, accessToken, done);
    }
  } catch (err) {
    console.log('==============ERROR==============\n', err);
  }
  // ,,,
});
export default dotwalletStrat;
