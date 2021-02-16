import App, { IApp } from '../models/app';
import Person, { IPerson } from '../models/person';
import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import { types } from '../types';
import { ROUTES, APP_SECRET } from '../config';
import { v4 as uuid } from 'uuid';
/** Accepts appSecret and appID. Compares token. Issues JWT and cookie. */
export default function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  router.post(ROUTES.DEV_VERIFY, async (ctx, next) => {
    const data: types.DevVerifyReq = ctx.request.body;
    // console.log({ devVerifyData: data });
    if (data.appSecret !== APP_SECRET)
      ctx.unauthorized(null, 'No secret found. Only administrators may verify devs');
    else {
      const dev: IPerson = await Person.findOne({ accountID: data.devID });
      if (!dev)
        ctx.unauthorized(
          null,
          'Dev account not found. Developers must register a personal EduVault account first',
        );
      else {
        dev.dev = { isVerified: true };
        ctx.oK(dev);
      }
    }
  });

  router.post(ROUTES.APP_REGISTER, async (ctx, next) => {
    const data: types.AppRegisterReq = ctx.request.body;
    // console.log({ data });
    return passport.authenticate('dev', async (err: string, foundPerson: IPerson) => {
      // passport isnt returning person...
      try {
        console.log({ err, foundPerson });
        const devPerson = await Person.findOne({ accountID: data.accountID });
        if (err || !devPerson) {
          console.log({ err });
          ctx.unauthorized(err, 'dev person account not found');
          return;
        }
        let exists = false;
        let existsError = {};
        await App.find({ name: data.name }, (err, apps) => {
          if (apps.length >= 1) {
            // console.log({ apps });
            exists = true;
            existsError = { error: 'app with same name exists', appID: apps[0].appID };
            return;
          }
        });
        await App.find({ appID: data.appID }, (err, apps) => {
          if (apps.length >= 1) {
            // console.log({ apps });
            exists = true;
            existsError = { error: 'appID exists', appID: apps[0].appID };
            return;
          }
        });
        if (exists) throw existsError;
        const newApp = new App();
        newApp.appID = data.appID || uuid();
        newApp.devID = data.accountID;
        newApp.name = data.name;
        newApp.description = data.description;
        newApp.save();
        // console.log({ devPerson });
        if (!devPerson.dev.apps) devPerson.dev.apps = [newApp.appID];
        else devPerson.dev.apps.push(newApp.appID);
        devPerson.save();
        ctx.oK(newApp);
      } catch (error) {
        console.log({ error });
        ctx.internalServerError(error);
      }
    })(ctx, next);
  });
  router.post(ROUTES.APP_UPDATE, async (ctx, next) => {
    const data: types.AppUpdateReq = ctx.request.body;
    console.log({ data });

    return passport.authenticate('dev', async (err: string, person: IPerson) => {
      console.log({ err, person });
      try {
        if (err) {
          console.log(err);
          ctx.unauthorized(err, err);
        } else {
          App.findOne({ appID: data.appID }, undefined, undefined, (err, app) => {
            if (err) ctx.notFound(err);
            else if (app.devID !== person.accountID) ctx.unauthorized();
            else {
              if (data.authorizedDomains) app.authorizedDomains = data.authorizedDomains;
              if (data.description) app.description = data.description;
              if (data.name) {
                let exists = false;
                App.find({ name: data.name }, (err, apps) => {
                  apps.forEach((app) => {
                    if (app.appID !== data.appID) exists = true;
                  });
                  if (!exists) app.name = data.name;
                });
                app.name = data.name;
              }
              app.save();
              ctx.oK(app);
            }
          });
        }
      } catch (error) {
        console.log({ error });
        ctx.internalServerError(error);
      }
    })(ctx, next);
  });

  return router;
}
