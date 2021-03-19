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
  PORT_API,
  PORT_APP,
  PORT_EXAMPLE,
} = config;
const PROD_HOST = process.env.SERVER_HOST || config.PROD_HOST;

export const { isProdEnv, isDockerEnv } = utils;
export const HOST = isProdEnv() ? PROD_HOST : LOCAL_HOST;
// const prefixes = [PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE];
const HTTP = 'https://';
export const URL_API = `${HTTP}${PREFIX_API}${HOST}`;
export const URL_APP = `${HTTP}${PREFIX_APP}${HOST}`;
export const URL_EXAMPLE = `${HTTP}${PREFIX_EXAMPLE}${HOST}`;
export const API_WS = 'wss://' + HOST;
export const ROUTES = config.ROUTES;
export const STORAGE_KEY = 'sourcelink';
// export const [URL_EXAMPLE] = prefixes.map((prefix) => formatURL(prefix, HOST));
