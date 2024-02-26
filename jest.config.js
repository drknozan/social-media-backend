module.exports = {
  moduleFileExtensions: ['js', 'ts', 'json'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    // '**/?(*.)+(spec|test).js?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  verbose: true,
};
