module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  roots: ['<rootDir>/src'],

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  watchPathIgnorePatterns: ['globalConfig'],
};
