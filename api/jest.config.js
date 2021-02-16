module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  roots: ['<rootDir>/src'],
  preset: '@shelf/jest-mongodb',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  watchPathIgnorePatterns: ['globalConfig'],
};
