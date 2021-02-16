export * from './encryption';
export * from './userRegistration';
export const isProdEnv = () => process.env.NODE_ENV === 'production';
export const isDockerEnv = () => process.env.IN_DOCKER === 'true';
