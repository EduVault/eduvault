import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import Person, { IPerson, hashPassword } from '../models/person';
import { DefaultState, Context } from 'koa';
import { PasswordLoginRes } from '../types';
import { ROUTES, CLIENT_CALLBACK, APP_SECRET, JWT_EXPIRY } from '../config';
import { createJwt, validateJwt, getJwtExpiry } from '../utils/jwt';
const local = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
  async function signup(ctx: Context) {
    const data = ctx.request.body;
    // const previousPerson = await Person.findOne({
    //   accountID: data.accountID,
    // });
    // if (previousPerson) {
    //   ctx.unauthorized({ error: 'person already exists' }, 'person already exists');
    //   return;
    // }
    if (
      !data.password ||
      !data.accountID ||
      !data.pwEncryptedKeyPair ||
      !data.pubKey ||
      !data.threadIDStr
    ) {
      ctx.unauthorized({ error: 'invalid signup' }, 'invalid signup');
      return;
    }
    const newPerson = new Person();
    newPerson.accountID = data.accountID;
    newPerson.password = hashPassword(data.password);
    newPerson.pwEncryptedKeyPair = data.pwEncryptedKeyPair;
    newPerson.pubKey = data.pubKey;
    newPerson.threadIDStr = data.threadIDStr;
    // console.log('data', data);
    console.log('new person', newPerson.toJSON());
    newPerson.save();
    await ctx.login(newPerson);
    ctx.session.jwt = createJwt(newPerson.accountID);
    await ctx.session.save();
    const returnData: PasswordLoginRes = {
      pwEncryptedKeyPair: newPerson.pwEncryptedKeyPair,
      jwt: ctx.session.jwt,
      pubKey: newPerson.pubKey,
      threadIDStr: newPerson.threadIDStr,
    };
    ctx.oK(returnData);
  }

  router.post(ROUTES.LOCAL, async (ctx, next) => {
    const person = await Person.findOne({ accountID: ctx.request.body.accountID });
    if (!person) return signup(ctx);
    // sign in
    else
      return passport.authenticate('local', async (err: string, person: IPerson) => {
        if (err) {
          ctx.unauthorized(err, err);
        } else {
          await ctx.login(person);
          if (ctx.session.jwt) {
            const now = new Date().getTime();
            const expiry = await getJwtExpiry(ctx.session.jwt);
            if (!expiry) ctx.session.jwt = createJwt(person.accountID);
            else if (now - expiry.getTime() < 1000 * 60 * 60 * 24) {
              ctx.session.oldJwt = JSON.parse(JSON.stringify(ctx.session.jwt));
              ctx.session.jwt = createJwt(person.accountID);
            }
          } else ctx.session.jwt = createJwt(person.accountID);
          await ctx.session.save();
          const returnData: PasswordLoginRes = {
            pwEncryptedKeyPair: person.pwEncryptedKeyPair,
            jwt: ctx.session.jwt,
            pubKey: person.pubKey,
            threadIDStr: person.threadIDStr,
          };
          console.log('login authorized. returnData', returnData);
          ctx.oK(returnData);
        }
      })(ctx, next);
  });
  return router;
};
export default local;
