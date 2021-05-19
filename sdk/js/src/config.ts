import { config, utils } from '@eduvault/shared';
import dotenv from 'dotenv';
export * from '@eduvault/shared';
dotenv.config({ path: './.env' });
export const { PREFIX_API, PREFIX_APP, PREFIX_EXAMPLE, LOCAL_HOST } = config;
export const { isProdEnv, isDockerEnv } = utils;

export const ROUTES = config.ROUTES;

const HTTP = 'http://';
export const formatURLApp = (host: string) => `${HTTP}${PREFIX_APP}${host}`;
export const formatURLApi = (host: string) => `${HTTP}${PREFIX_API}${host}`;
export const formatWSApi = (host: string) => 'wss://' + host;
