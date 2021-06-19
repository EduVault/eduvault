import cors from '@koa/cors';
import session from 'koa-session';
import { utils, isTestEnv } from './utils';
import { config } from '@eduvault/shared';
export { config };
import { StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { StrategyOptionWithRequest } from 'passport-facebook';
// only for local build
import dotenv from 'dotenv';
if (!process.env.GITHUB_ACTIONS) dotenv.config({ path: '../.env' });
export const { PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE, LOCAL_HOST } = config;
export const { isProdEnv, isDockerEnv } = utils;
export const PORT_API = 30333;
const PROD_HOST = process.env.PROD_HOST;
export const HOST = isProdEnv() ? PROD_HOST : LOCAL_HOST;

// const prefixes = [PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE];
const HTTP = 'http://';
const HTTPS = 'https://';
/** https://api.eduvault or https://api.localhost */
export const URL_API = `${HTTPS}${PREFIX_API}${HOST}`;
export const URL_APP = `${HTTPS}${PREFIX_APP}${HOST}`;
export const URL_EXAMPLE = `${HTTPS}${PREFIX_EXAMPLE}${HOST}`;
export const URL_API_HTTP = `${HTTP}${PREFIX_API}${HOST}`;
export const URL_APP_HTTP = `${HTTP}${PREFIX_APP}${HOST}`;
export const URL_EXAMPLE_HTTP = `${HTTP}${PREFIX_EXAMPLE}${HOST}`;
// console.log({ URL_API, URL_APP });
export const validDomains = [
  URL_API,
  URL_APP,
  URL_EXAMPLE,
  URL_API_HTTP,
  URL_APP_HTTP,
  URL_EXAMPLE_HTTP,
];

export const APP_SECRET = process.env.APP_SECRET || 'VerySecretPassword';
if (isProdEnv() && APP_SECRET === 'VerySecretPassword') {
  throw new Error('APP_SECRET missing in production');
}

export const ROUTES = config.ROUTES;

export const CORS_CONFIG: cors.Options = {
  credentials: true,
  origin: (ctx) => {
    // console.log(
    //   '===================================ctx.request.header.origin===================================\n',

    //   { nodeENV: process.env.NODE_ENV, validDomains, headersOrigin: ctx.request.header.origin },
    // );
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
  // autoCommit: true /** (boolean) automatically commit headers (default true) */,
  // overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: !isTestEnv() /** (boolean) httpOnly or not (default true) */,
  // signed: true /** (boolean) signed or not (default true) */,
  rolling:
    !isTestEnv() /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew:
    !isTestEnv() /** (boolean) renew session when session is nearly expired, so we can always keep person logged in. (default is false)*/,
  secure: !isTestEnv() /** (boolean) isProdEnv() secure cookie*/,
  sameSite: isTestEnv() ? null : 'none',
  /** (string) isProdEnv() session cookie sameSite options (default null, don't set it) */
} as Partial<session.opts>;

/** expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d" */
export const JWT_EXPIRY = '30d';

// this will be deprecated. Will need to look up app info in DB and callback to their registered callback
/** Sometimes the callback cannot find the referer, In a real setup,  we will need apps that use this backend to register a callback */
export const CLIENT_CALLBACK = isTestEnv() ? URL_APP_HTTP : URL_APP;

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

export const SYNC_DEBOUNCE_TIME = isTestEnv() ? 1000 : 5000;

console.log({
  NODE_ENV: process.env.NODE_ENV,
  TEST_ENV: isTestEnv(),
  APP_SECRET,
  PROD_HOST,
  HOST,
  PORT_API,
  GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
  SESSION_OPTIONS,
});
