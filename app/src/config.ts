export { config } from '@eduvault/shared';
import { config, utils } from '@eduvault/shared';

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export const ROUTES = config.ROUTES;
export const STORAGE_KEY = 'sourcelink';
export const API_URL = utils.isProdEnv() ? config.URL_API_PROD : config.URL_API_LOCAL;
export const API_WS = utils.isProdEnv() ? config.WS_ROOT_PROD : config.WS_ROOT_LOCAL;
export const APP_URL = utils.isProdEnv() ? config.URL_APP_PROD : config.URL_APP_LOCAL;
