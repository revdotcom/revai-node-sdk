module.exports = {
  displayName: "Integration",
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [],
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  },
  testMatch: [
    "**/test/integration/test/**/*.test.js"
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist']
};
