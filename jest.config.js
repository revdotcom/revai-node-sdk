module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/setup.ts'],
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  },
};
