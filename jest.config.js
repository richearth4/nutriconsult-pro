module.exports = {
  testEnvironment: 'jsdom',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  testMatch: ['**/tests/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
