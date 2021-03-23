import { config, utils } from '@eduvault/shared';
import dotenv from 'dotenv';
export * from '@eduvault/shared';
dotenv.config({ path: './.env' });
export const {
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

const HTTP = 'https://';
export const formatURLApp = (host: string) => `${HTTP}${PREFIX_APP}${host}`;
export const formatURLApi = (host: string) => `${HTTP}${PREFIX_API}${host}`;
export const formatWSApi = (host: string) => 'wss://' + host;
