export const STORAGE_KEY = 'sourcelink';
const PROD_HOST = process.env.VUE_APP_PROD_HOST;
export const HOST = process.env.NODE_ENV === 'production' ? PROD_HOST : 'localhost';
