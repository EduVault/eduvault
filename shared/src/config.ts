// PORTS will also set in .env. Make sure they match!
export const PORT_API = 3003;
export const PORT_APP = 8081;
export const PORT_EXAMPLE = 8082;
export const PORT_HOME_PAGE = 8083;
export const PORT_CYPRESS = 9222;
export const LOCAL_HOST = 'localhost';
export const PROD_HOST = 'eduvault.org';
export const PREFIX_APP = 'app.';
export const PREFIX_EXAMPLE = 'example.';
export const PREFIX_API = 'api.';

// must be set in each app
// export const APP_SECRET = process.env.APP_SECRET

export const ROUTES = {
  LOGOUT: '/logout',
  AUTH_CHECK: '/auth-check',
  VERIFY_JWT: '/verify-jwt',

  GET_PERSON: '/get-person',
  GET_JWT: '/get-jwt',
  FACEBOOK_AUTH: '/auth/facebook',
  FACEBOOK_AUTH_CALLBACK: '/auth/facebook/callback',
  GOOGLE_AUTH: '/auth/google',
  GOOGLE_AUTH_CALLBACK: '/auth/google/callback',
  DOTWALLET_AUTH: '/auth/dotwallet',
  PASSWORD_AUTH: '/auth/password',

  APP_AUTH: '/auth/app',
  APP_TOKEN_ISSUE: '/auth/app/issue-token',
  APP_REGISTER: '/app/register',
  APP_UPDATE: '/app/update',
  DEV_VERIFY: '/dev/verify',

  TEXTILE_RENEW: '/renew-textile',
};

const HTTP = 'http://';
const HTTPS = 'https://';

/**
 * @returns http(s):// + prefix + host
 * @summary returns http if given localhost, https otherwise
 * @param  {string} prefix should have trailing . e.g. "app." or "api."
 * @param {string} host should include domain. e.g. "eduvault.org"
 * @example https://app.eduvault.org
 */
export const formatURL = (prefix: string, host: string) => {
  return `${host === 'localhost' ? HTTP : HTTPS}${prefix + host}`;
};

export const GOOGLE_CLIENT_ID =
  '487529271786-09ipprn3fe65lmv5rhgbv10rsp1lnra1.apps.googleusercontent.com';
export const FACEBOOK_CLIENT_ID = '2837236683270597';
export const DOTWALLET_APP_ID = '23d00104123806644423fb1409faf6be5';
export const TEXTILE_USER_API_KEY = 'bvshw5u4veaarb33afkoyw74k5e';
export const TEXTILE_ORG_API_KEY = 'bvxy3pdka4kzt2rotbazwrtj55e';
// set in .env, will be used in API, or sdk/js config.ts
// export const TEXTILE_USER_API_SECRET = process.env.TEXTILE_USER_API_SECRET;
// export const DOTWALLET_SECRET = process.env.DOTWALLET_SECRET;
// export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
