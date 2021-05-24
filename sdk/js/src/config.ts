import { config, utils } from '@eduvault/shared';
import dotenv from 'dotenv';
export * from '@eduvault/shared';
if (!process.env.GITHUB_ACTIONS) dotenv.config({ path: './.env' });
export const { PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE, LOCAL_HOST } = config;
export const { isProdEnv, isDockerEnv } = utils;
const isTestEnv = () =>
  process.env.TEST === '1' || process.env.VUE_APP_TEST === '1';

export const ROUTES = config.ROUTES;

const HTTP = 'http://';
const HTTPS = 'https://';
const WSS = 'wss://';
const WS = 'ws://';
export const formatURLApp = (host: string) => `${HTTP}${PREFIX_APP}${host}`;
export const formatURLApi = (host: string) =>
  `${isTestEnv() ? HTTP : HTTPS}${PREFIX_API}${host}`;
export const formatWSApi = (host: string) =>
  `${isTestEnv() ? WS : WSS}${PREFIX_API}${host}`;
