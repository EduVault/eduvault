import cors from '@koa/cors';
import session from 'koa-session';
import { utils } from './utils';
import { config } from '@eduvault/shared';
export { config };
import { StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { StrategyOptionWithRequest } from 'passport-facebook';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
export const APP_SECRET = process.env.APP_SECRET ?? 'VerySecretPassword';
if (utils.isProdEnv() && APP_SECRET === 'VerySecretPassword') {
  throw new Error('APP_SECRET missing in production');
}

// this might be incorrect. need to test where docker is sending requests. chould be process.env.IN_DOCKER ? local : prod
export const URL_API = utils.isProdEnv() ? config.URL_API_PROD : config.URL_API_LOCAL;
/** for dev, needs to match service name from docker-compose file. if hosting on heroku MONGO_URI will be an env, if not you need to manually create one*/
export const MONGO_URI =
  process.env.MONGODB_URI || process.env.IN_DOCKER
    ? 'mongodb://mongo:27017'
    : 'mongodb://127.0.0.1/';

export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'eduvault';

export const ROUTES = config.ROUTES;

export const CORS_CONFIG: cors.Options = {
  credentials: true,
  origin: (ctx) => {
    console.log(
      '===================================ctx.request.header.origin===================================\n',
      process.env.NODE_ENV,
      ctx.request.header.origin,
    );

    // this might be incorrect. need to test where docker is sending requests. chould be process.env.IN_DOCKER ? local : prod

    let validDomains = utils.isProdEnv()
      ? config.PROD_DOMAINS
      : config.PROD_DOMAINS.concat([...config.DEV_DOMAINS]);

    console.log(validDomains);
    if (validDomains.indexOf(ctx.request.header.origin) !== -1) {
      // console.log('\n is valid domain');
      return ctx.request.header.origin;
    }
    return validDomains[0]; // we can't return void, so let's return one of the valid domains
  },
};

export const SESSION_OPTIONS = {
  key: 'koa.sess' /** (string) cookie key (default is koa.sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 1000 * 60 * 60 * 24 * 2 /** two days */,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: utils.isProdEnv() ? true : false /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: true /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: false /** (boolean) renew session when session is nearly expired, so we can always keep person logged in. (default is false)*/,
  secure: utils.isProdEnv() ? true : false /** (boolean) secure cookie*/,
  sameSite: utils.isProdEnv()
    ? 'none'
    : false /** (string) session cookie sameSite options (default null, don't set it) */,
} as Partial<session.opts>;

/** expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d" */
export const JWT_EXPIRY = '30d';

// this will be deprecated. Will need to look up app info in DB and callback to their registered callback
/** Sometimes the callback cannot find the referer, In a real setup, we will need apps that use this backend to register a callback */
export const CLIENT_CALLBACK = utils.isProdEnv() ? config.URL_ROOT_PROD : config.URL_APP_LOCAL;

export const TEXTILE_USER_API_SECRET = process.env.TEXTILE_USER_API_SECRET;
export const DOTWALLET_SECRET = process.env.DOTWALLET_SECRET;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;

export const GOOGLE_CONFIG = {
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: ROUTES.GOOGLE_AUTH_CALLBACK,
  passReqToCallback: true,
} as StrategyOptionsWithRequest;

export const FACEBOOK_CONFIG = {
  clientID: config.FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: ROUTES.FACEBOOK_AUTH_CALLBACK,
  profileFields: ['id', 'email', 'name', 'photos'],
  display: 'popup',
  passReqToCallback: true,
} as StrategyOptionWithRequest;
