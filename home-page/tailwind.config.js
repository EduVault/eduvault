/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  theme: {
    fontFamily: {
      display: ['Inter', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
      mono: ['Inter', 'Menlo', 'Monaco', 'Consolas'],
    },
    inset: {
      '0': 0,
      auto: 'auto',
      '1/2': '50%',
      '1/6': '16.6%',
      '1/3': '33.3%',
      '-16': '-4rem',
    },
    minHeight: {
      '0': '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      full: '100%',
      screen: '100vh',
      screen25: '25vh',
      screen50: '50vh',
      screen75: '75vh',
    },

    extend: {
      colors: {
        orange: '#F5841F',
        lightpurple: '#E1D2FF',
        darkblue: '#0F197C',
        tealgreen: '#32B275',
      },
      maxWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',

        screen: '100vh',
        screen25: '25vh',
        screen50: '50vh',
        screen75: '75vh',
        xxxs: '10rem',
        xxs: '15rem',
      },
    },
  },
  variants: {},
  plugins: [],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js',
    ],
  },
}
