import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/app.ts',        // skip entry point
    '!src/types/**',      // skip pure interfaces
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};

export default config;