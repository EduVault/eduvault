import { config, utils } from '@eduvault/shared';
export * from '@eduvault/shared';

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
