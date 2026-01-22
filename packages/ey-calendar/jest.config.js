/** @type {import('jest').Config} */
module.exports = {
  displayName: '@emoory/ey-calendar',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Racine du projet
  rootDir: '.',

  // Fichier de setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Pattern de recherche des tests
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
  ],

  // Transformation TypeScript
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Module name mapping
  moduleNameMapper: {
    // CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Alias pour simplifier les imports dans les tests
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**',
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 65,
      lines: 70,
      statements: 70,
    },
  },

  coverageDirectory: '<rootDir>/coverage',

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  // Verbose output
  verbose: true,
};
