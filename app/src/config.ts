export { config } from '@eduvault/shared';
import { config, utils } from '@eduvault/shared';
// for local build
import dotenv from 'dotenv';
if (!process.env.GITHUB_ACTIONS) dotenv.config({ path: '../../.env' });

export const { PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE, LOCAL_HOST } = config;
const PROD_HOST = process.env.VUE_APP_PROD_HOST;
const isTestEnv = () => process.env.TEST === '1' || process.env.VUE_APP_TEST === '1';

console.log({ env: process.env });
export const { isProdEnv, isDockerEnv } = utils;

export const HOST = isProdEnv() ? PROD_HOST : LOCAL_HOST;


// const prefixes = [PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE];
const HTTP = 'http://';
const HTTPS = 'https://';
const WSS = 'wss://';
const WS = 'ws://';
export const URL_API = `${HTTPS}${PREFIX_API}${HOST}`;
export const URL_APP = `${HTTP}${PREFIX_APP}${HOST}`;
export const URL_EXAMPLE = `${HTTP}${PREFIX_EXAMPLE}${HOST}`;
export const API_WS = `${WSS}${PREFIX_API}${HOST}`;
export const ROUTES = config.ROUTES;
export const STORAGE_KEY = 'sourcelink';
// console.log({ URL_API, URL_APP, API_WS });
