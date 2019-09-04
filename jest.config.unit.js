module.exports = {
  displayName: "Unit",
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/unit/setup.ts'],
  globals: {
    'ts-jest': {
        diagnostics: false
    }
  },
  testMatch: [
    '**/test/unit/**/*.spec.ts'
  ]
};
