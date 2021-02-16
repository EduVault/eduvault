import App, { IApp } from '../../models/app';
import { compareAppLoginToken } from '../../utils/jwt';
import * as passportCustom from 'passport-custom';
import { types, AppAndTokenData, AppTokenData } from 'types';

const CustomStrategy = passportCustom.Strategy;

const appStrat = new CustomStrategy(async (req, done) => {
  const data: types.AppAuthReq = req.body;
  const token = data.appLoginToken;
  const appID = data.appID;
  const app: null | IApp = await App.findOne({ appID });
  if (!app) {
    done('app not found', false);
  } else {
    // console.log({ app });
    const tokenData = await compareAppLoginToken(token, appID);
    if (typeof tokenData === 'string') done(tokenData);
    else {
      const result: AppAndTokenData = { ...tokenData.data, ...app.toObject() };
      done(null, result);
    }
  }
});
export default appStrat;
