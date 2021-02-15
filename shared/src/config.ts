// PORTS will also set in .env. Make sure they match!
export const PORT_API = 3003;
export const PORT_APP = 8081;
export const PORT_EXAMPLE = 8082;

export const PORT_HOME_PAGE = 8083;

export const URL_ROOT_LOCAL = 'http://localhost';
export const URL_ROOT_PROD = 'https://eduvault.org';
export const WS_ROOT_LOCAL = 'ws://localhost';
export const WS_ROOT_PROD = 'wss://eduvault.org';

// must be set in each app
// export const APP_SECRET = process.env.APP_SECRET

export const ROUTES = {
  HOME_PAGE: '/',
  APP: '/app',
  API: '/api',
  EXAMPLE: '/example',

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

export const URL_API_LOCAL = URL_ROOT_LOCAL + ':' + PORT_API;
export const URL_APP_LOCAL = URL_ROOT_LOCAL + ':' + PORT_APP; // 'http://localhost:8081';
export const URL_EXAMPLE_LOCAL = URL_ROOT_LOCAL + ':' + PORT_EXAMPLE;
export const URL_HOME_PAGE_LOCAL = URL_ROOT_LOCAL + ':' + PORT_HOME_PAGE;

export const URL_API_PROD = URL_ROOT_PROD + ROUTES.API; // 'https://eduvault.org/api
export const URL_APP_PROD = URL_ROOT_PROD + ROUTES.APP;
export const URL_EXAMPLE_PROD = URL_ROOT_PROD + ROUTES.EXAMPLE;
export const URL_HOME_PAGE_PROD = URL_ROOT_PROD + ROUTES.HOME_PAGE;

export const PROD_DOMAINS = [URL_ROOT_PROD];
export const DEV_DOMAINS = [URL_APP_LOCAL, URL_EXAMPLE_LOCAL, URL_HOME_PAGE_LOCAL];

export const GOOGLE_CLIENT_ID =
  '487529271786-09ipprn3fe65lmv5rhgbv10rsp1lnra1.apps.googleusercontent.com';
export const FACEBOOK_CLIENT_ID = '2837236683270597';
export const DOTWALLET_APP_ID = '23d00104123806644423fb1409faf6be5';
export const TEXTILE_USER_API_KEY = 'bfqeahwefqccqreqwfeeq';
// set in .env, will be used in API, or sdk/js config.ts
// export const TEXTILE_USER_API_SECRET = process.env.TEXTILE_USER_API_SECRET;
// export const DOTWALLET_SECRET = process.env.DOTWALLET_SECRET;
// export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
