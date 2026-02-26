export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': ['babel-jest', { configFile: './.babelrc' }],
  },
  transformIgnorePatterns: ['/node_modules/(?!mongodb-memory-server)'],
  testMatch: ['**/__tests__/**/*.test.js'],
  testTimeout: 30000,
}
