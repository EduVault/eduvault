module.exports = {
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': false,
  },
  projects: [
    {
      root: './app',
      package: './package.json',
      tsconfig: './tsconfig.json',
    },
    {
      root: './example',
      package: './package.json',
      tsconfig: './tsconfig.json',
    },
    {
      root: './home-page',
      package: './package.json',
      tsconfig: './tsconfig.json',
    },
  ],
};
