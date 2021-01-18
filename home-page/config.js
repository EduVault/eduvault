export const EDUVAULT_APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://eduvault.org/app/'
    : 'http://localhost:8081'

export const EXAMPLE_APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://eduvault.org/example/'
    : 'http://localhost:8082'
