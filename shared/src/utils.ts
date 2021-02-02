export const isProdEnv = () => process.env.NODE_ENV === 'production';
export const isDockerEnv = () => process.env.IN_DOCKER === 'true';
