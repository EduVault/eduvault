export const STORAGE_KEY = 'sourcelink';
// export const HOST = 'eduvault-staging.click';
export const HOST = process.env.NODE_ENV === 'production' ? 'eduvault-staging.click' : 'localhost';
