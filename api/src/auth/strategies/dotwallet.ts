// import { Strategy as CustomStrategy } from 'passport-custom';
// import axios from 'axios';
// import Person, { DotwalletAccessData, DotwalletProfile } from '../../models/person';
// import { config, DOTWALLET_SECRET } from '../../config';
// import { createDotwalletAccount } from '../../utils/newSocialMedia';
// import url from 'url';
// const dotwalletStrat = new CustomStrategy(async (ctx, done) => {
//   try {
//     const code = ctx.query.code;
//     console.log('==============got code==============\n', code);
//     const data = {
//       app_id: config.DOTWALLET_APP_ID,
//       secret: DOTWALLET_SECRET,
//       code: code,
//     };
//     console.log('==============data==============\n', data);

//     const accessTokenRequest = await axios.post(
//       'https://www.ddpurse.com/platform/openapi/access_token',
//       data,
//     );
//     console.log('==============access token result==============\n', accessTokenRequest);
//     const accessData: DotwalletAccessData = accessTokenRequest.data.data;
//     const accessToken = accessData.access_token;
//     if (accessToken) {
//       const personInfoRequest = await axios.get(
//         'https://www.ddpurse.com/platform/openapi/get_person_info?access_token=' + accessToken,
//       );
//       console.log('==============person info result==============\n', personInfoRequest.data);
//       const profile: DotwalletProfile = personInfoRequest.data.data;
//       const id = profile.person_open_id;
//       const person = await Person.findOne({ accountID: id });
//       if (person && person.dotwallet) return done(null, person);
//       else
//         return createDotwalletAccount(person ? person : new Person(), profile, accessToken, done);
//     }
//   } catch (err) {
//     console.log('==============ERROR==============\n', err);
//   }
//   // ,,,
// });
// export default dotwalletStrat;
