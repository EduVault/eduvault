import { config, utils } from '@eduvault/shared';
import dotenv from 'dotenv';
export * from '@eduvault/shared';
dotenv.config({ path: './.env' });
export const {
  formatURL,
  PREFIX_API,
  PREFIX_APP,
  PREFIX_EXAMPLE,
  LOCAL_HOST,
  PORT_CYPRESS,
} = config;
export const { isProdEnv } = utils;

export const APP_SECRET = process.env.APP_SECRET || 'VerySecretPassword';
// console.log({ APP_SECRET });
export const ROUTES = config.ROUTES;

const PROD_HOST = process.env.SERVER_HOST || config.PROD_HOST;
export const HOST = isProdEnv() ? PROD_HOST : LOCAL_HOST;
const prefixes = [PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE];
export const [URL_API, URL_APP, URL_EXAMPLE] = prefixes.map((prefix) =>
  formatURL(prefix, HOST)
);
export const API_WS = isProdEnv() ? 'wss://' + HOST : 'ws://' + HOST;
console.log({ URL_API, URL_APP, URL_EXAMPLE });
