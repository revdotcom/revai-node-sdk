module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  timers: 'fake',
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  }
};
