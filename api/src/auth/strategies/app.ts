import { IApp } from '../../models/app';
import { compareAppLoginToken } from '../../utils/jwt';
import * as passportCustom from 'passport-custom';
import { types, AppAndTokenData, AppTokenData } from 'types';
import { Database } from '@textile/threaddb';

const CustomStrategy = passportCustom.Strategy;

const appStrat = (db: Database) => {
  return new CustomStrategy(async (req, done) => {
    const data: types.AppAuthReq = req.body;
    const token = data.appLoginToken;
    const appID = data.appID;

    const app: IApp = await db.collection<IApp>('app').findOne({ appID });
    if (!app) {
      done('app not found', false);
    } else {
      // console.log({ app });
      const tokenData = await compareAppLoginToken(token, appID);
      if (typeof tokenData === 'string') done(tokenData);
      else {
        const result: AppAndTokenData = { ...tokenData.data, ...app };
        done(null, result);
      }
    }
  });
};

export default appStrat;
