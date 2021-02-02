// eslint-disable-next-line @typescript-eslint/no-var-requires
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = {
  devServer: {
    public: 'localhost:8082',
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8082,
  },
  configureWebpack: {
    plugins: [
      // new TsconfigPathsPlugin({
      //   /* options: see below */
      // }),
    ],
  },
};
