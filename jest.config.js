module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  moduleNameMapper: {
    '^#src/(.*)$': '<rootDir>/src/$1',
    '^#test/(.*)$': '<rootDir>/test/$1',
  },
  setupFiles: ['./test/setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/src/utils/Logger.ts',
    // '<rootDir>/src/utils/startingProcess.ts',
    // move these files to a separate project, and push to npm-registry
  ],
};
