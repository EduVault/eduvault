export { config } from '@eduvault/shared';
import { config, utils } from '@eduvault/shared';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export const {
  formatURL,
  PREFIX_API,
  PREFIX_APP,
  PREFIX_EXAMPLE,
  LOCAL_HOST,
  PORT_CYPRESS,
} = config;
const PROD_HOST = process.env.SERVER_HOST || config.PROD_HOST;

export const { isProdEnv } = utils;
export const HOST = isProdEnv() ? PROD_HOST : LOCAL_HOST;
const prefixes = [PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE];

export const ROUTES = config.ROUTES;
export const STORAGE_KEY = 'sourcelink';
export const API_WS = isProdEnv() ? 'wss://' + HOST : 'ws://' + HOST;
export const URL_API = 'https://api.localhost';
export const URL_APP = 'https://app.localhost';
// export const [URL_EXAMPLE] = prefixes.map((prefix) => formatURL(prefix, HOST));
