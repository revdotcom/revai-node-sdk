module.exports = {
  displayName: "Integration",
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [],
  timers: 'fake',
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  },
  testMatch: [
    "**/test/integration/test/*.test.js"
  ]
};
