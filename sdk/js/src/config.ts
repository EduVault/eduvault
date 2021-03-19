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
  PORT_APP,
  PORT_API,
  PORT_EXAMPLE,
} = config;
export const { isProdEnv, isDockerEnv } = utils;

export const APP_SECRET = process.env.APP_SECRET || 'VerySecretPassword';
// console.log({ APP_SECRET });
export const ROUTES = config.ROUTES;

const PROD_HOST = process.env.SERVER_HOST || config.PROD_HOST;
export const HOST = isProdEnv() ? PROD_HOST : LOCAL_HOST;
// const prefixes = [PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE];
const HTTP = 'https://';
export const URL_API = `${HTTP}${PREFIX_API}${HOST}`;
export const URL_APP = `${HTTP}${PREFIX_APP}${HOST}`;
export const URL_EXAMPLE = `${HTTP}${PREFIX_EXAMPLE}${HOST}`;
export const API_WS = 'wss://' + HOST;
// console.log({ URL_API, URL_APP });
