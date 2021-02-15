import { config, utils } from '@eduvault/shared';
import dotenv from 'dotenv';
export * from '@eduvault/shared';

dotenv.config({ path: './.env' });
export const APP_SECRET = process.env.APP_SECRET || 'VerySecretPassword';
// console.log({ APP_SECRET });
export const ROUTES = config.ROUTES;
export const URL_API = utils.isProdEnv()
  ? config.URL_API_PROD
  : config.URL_API_LOCAL;
export const WS_API = utils.isProdEnv()
  ? config.WS_ROOT_PROD
  : config.WS_ROOT_LOCAL;
export const URL_APP = utils.isProdEnv()
  ? config.URL_APP_PROD
  : config.URL_APP_LOCAL;
