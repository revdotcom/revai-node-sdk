module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/unit-tests/setup.ts'],
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  },
};
