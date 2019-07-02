module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/unit/setup.ts'],
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  },
};
