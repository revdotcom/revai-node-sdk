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
  testMatch: ["<rootDir>/test/unit/*.spec.*"]
};
