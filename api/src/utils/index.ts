export { utils } from '@eduvault/shared';
export const isTestEnv = () => process.env.TEST === '1';
export const isUnitTestEnv = () => process.env.UNIT_TEST === '1';
