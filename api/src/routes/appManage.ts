import { IApp } from '../models/app';
import { IPerson } from '../models/person';
import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import { types } from '../types';
import { ROUTES, APP_SECRET } from '../config';
import { v4 as uuid } from 'uuid';
import { Database } from '@textile/threaddb';
import { sync } from '../textile/helpers';
import { isTestEnv } from '../utils';
/** Accepts appSecret and appID. Compares token. Issues JWT and cookie. */
export default function (
  router: Router<DefaultState, Context>,
  passport: typeof KoaPassport,
  db: Database,
) {
  router.post(ROUTES.DEV_VERIFY, async (ctx, next) => {
    const data: types.DevVerifyReq = ctx.request.body;
    // console.log({ devVerifyData: data });
    if (data.appSecret !== APP_SECRET)
      ctx.unauthorized(null, 'No secret found. Only administrators may verify devs');
    else {
      const dev = await db.collection<IPerson>('person').findOne({ accountID: data.devID });
      if (!dev)
        ctx.unauthorized(
          null,
          'Dev account not found. Developers must register a personal EduVault account first',
        );
      else {
        dev.dev = { isVerified: true };
        await dev.save();
        // sync(db, 'person');

        // if (isTestEnv()) {
        //   setTimeout(function () {
        //     ctx.oK(dev);
        //   }, 100);
        //   var end = Date.now() + 3300;
        //   while (Date.now() < end);
        // }
        ctx.oK(dev);
      }
    }
  });

  router.post(ROUTES.APP_REGISTER, async (ctx, next) => {
    const data: types.AppRegisterReq = ctx.request.body;
    // console.log({ APP_REGISTERdata: data });
    return passport.authenticate('dev', async (err: string, foundPerson: IPerson) => {
      // passport isnt returning person...
      try {
        console.log({ err, foundPerson });
        const devPerson = await db
          .collection<IPerson>('person')
          .findOne({ accountID: data.accountID });
        // console.log({ devPerson });
        if (err || !devPerson) {
          console.log({ err });
          ctx.unauthorized(err, 'dev person account not found');
          return;
        }
        let exists = false;
        let existsError = {};
        let appByName;
        let appByID;
        try {
          appByName = await db.collection<IApp>('app').findOne({ name: data.name });
          appByID = await db.collection<IApp>('app').findOne({ appID: data.appID });
        } catch (error) {
          // console.log('finding app error ', error);
        }
        if (appByName) {
          exists = true;
          existsError = {
            error: 'app with same name exists',
            appID: appByName && appByName.appID ? appByName.appID : null,
          };
        }
        if (appByID) {
          exists = true;
          existsError = {
            error: 'appID exists',
            appID: appByID && appByID.appID ? appByID.appID : null,
          };
        }
        // console.log({ exists, existsError });
        if (exists) throw existsError;
        const newApp: IApp = { _id: uuid(), appID: uuid(), devID: data.accountID, name: data.name };
        if (data.description) newApp.description = data.description;
        await db.collection<IApp>('app').insert(newApp);
        // console.log({ devPerson });
        if (!devPerson.dev.apps) devPerson.dev.apps = [newApp.appID];
        else devPerson.dev.apps.push(newApp.appID);
        await devPerson.save();
        ctx.oK(newApp);
      } catch (error) {
        console.log({ error });
        ctx.internalServerError(error);
      }
    })(ctx, next);
  });
  router.post(ROUTES.APP_UPDATE, async (ctx, next) => {
    const data: types.AppUpdateReq = ctx.request.body;
    // console.log({ data });

    return passport.authenticate('dev', async (err: string, person: IPerson) => {
      console.log({ err, person });
      try {
        if (err) {
          console.log(err);
          ctx.unauthorized(err, err);
        } else {
          const app = await db.collection<IApp>('app').findOne({ appID: data.appID });
          if (!app) return ctx.notFound(err);
          else if (app.devID !== person.accountID) return ctx.unauthorized();
          else {
            if (data.authorizedDomains) app.authorizedDomains = data.authorizedDomains;
            if (data.description) app.description = data.description;
            if (data.name) app.name = data.name;
            await app.save();
            ctx.oK(app);
          }
        }
      } catch (error) {
        console.log({ error });
        ctx.internalServerError(error);
      }
    })(ctx, next);
  });

  return router;
}
