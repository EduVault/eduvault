import dotenv from 'dotenv';
import { StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { StrategyOptionWithRequest } from 'passport-facebook';
import passportJwt from 'passport-jwt';
import session from 'koa-session';
import cors from '@koa/cors';
import Koa from 'koa';

const ExtractJwt = passportJwt.ExtractJwt;

dotenv.config({ path: './.env.local' }); // If the .env file is not just .env, you need this config

/** needs to match ports in docker-compose file */
const PORT = parseInt(process.env.PORT, 10) || 3003;
/** for dev, needs to match service name from docker-compose file. if hosting on heroku MONGO_URI will be an env, if not you need to manually create one*/
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017';
const ROOT_URL =
  process.env.NODE_ENV === 'production' ? 'https://eduvault.herokuapp.com' : 'localhost:' + PORT;

const CORS_CONFIG: cors.Options = {
  credentials: true,
  origin: (ctx) => {
    console.log(
      '===================================ctx.request.header.origin===================================\n',
      process.env.NODE_ENV,
      ctx.request.header.origin,
    );
    const productionDomains = [
      'https://master--thirsty-ardinghelli-577c63.netlify.app',
      'https://thirsty-ardinghelli-577c63.netlify.app',
    ];
    const devDomains = ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'];
    let validDomains =
      process.env.NODE_ENV === 'development'
        ? productionDomains.concat([...devDomains])
        : productionDomains;
    console.log(validDomains);
    if (validDomains.indexOf(ctx.request.header.origin) !== -1) {
      console.log('\n is valid');
      return ctx.request.header.origin;
    }
    return validDomains[0]; // we can't return void, so let's return one of the valid domains
  },
};
const APP_SECRET = process.env.APP_SECRET || 'secretString!%@#$@%';

/** expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d" */
const JWT_EXPIRY = '30d';

const SESSION_OPTIONS = {
  key: 'koa.sess' /** (string) cookie key (default is koa.sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 1000 * 60 * 60 * 48 /** 48 hours*/,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly:
    process.env.NODE_ENV === 'production'
      ? true
      : false /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: true /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
  secure: process.env.NODE_ENV === 'production' ? true : false /** (boolean) secure cookie*/,
  sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : false /** (string) session cookie sameSite options (default null, don't set it) */,
} as Partial<session.opts>;

/** Sometimes the callback cannot find the referer, In a real setup, we might need apps that use this backend to register a callback */
const CLIENT_CALLBACK =
  process.env.NODE_ENV === 'production'
    ? 'https://thirsty-ardinghelli-577c63.netlify.app/'
    : 'http://localhost:8080/home/';

const ROUTES = {
  FACEBOOK_AUTH: '/auth/facebook',
  FACEBOOK_AUTH_CALLBACK: '/auth/facebook/callback',
  GOOGLE_AUTH: '/auth/google',
  GOOGLE_AUTH_CALLBACK: '/auth/google/callback',
  LOCAL: '/auth/local',
  VERIFY_JWT: '/verify-jwt',
  TEXTILE_RENEW: '/renew-textile',
  DOTWALLET_AUTH: '/auth/dotwallet',
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CONFIG = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: ROUTES.GOOGLE_AUTH_CALLBACK,
  passReqToCallback: true,
} as StrategyOptionsWithRequest;

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const FACEBOOK_CONFIG = {
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: ROUTES.FACEBOOK_AUTH_CALLBACK,
  profileFields: ['id', 'email', 'name', 'photos'],
  display: 'popup',
  passReqToCallback: true,
} as StrategyOptionWithRequest;

const DOTWALLET_SECRET = process.env.DOTWALLET_SECRET;
const DOTWALLET_APP_ID = process.env.DOTWALLET_APP_ID;

/** Textile */
const TEXTILE_USER_API_KEY = process.env.TEXTILE_USER_API_KEY;
const TEXTILE_USER_API_SECRET = process.env.TEXTILE_USER_API_SECRET;

export {
  PORT,
  MONGO_URI,
  ROOT_URL,
  CORS_CONFIG,
  APP_SECRET,
  JWT_EXPIRY,
  SESSION_OPTIONS,
  ROUTES,
  GOOGLE_CONFIG,
  FACEBOOK_CONFIG,
  CLIENT_CALLBACK,
  TEXTILE_USER_API_KEY,
  TEXTILE_USER_API_SECRET,
  DOTWALLET_SECRET,
  DOTWALLET_APP_ID,
};
