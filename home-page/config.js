const isProdEnv = () => process.env.NODE_ENV === 'production'
export const PROD_HOST = process.env.VUE_APP_PROD_HOST || 'eduvault-staging.click'
const HOST = isProdEnv() ? PROD_HOST : 'localhost'

export const EDUVAULT_APP_URL = 'http://app.' + HOST

export const EXAMPLE_APP_URL = 'http://example.' + HOST
