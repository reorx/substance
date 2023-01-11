module.exports = {
  "roots": [
      "src"
  ],
  "transform": {
      "^.+\\.ts$": "ts-jest"
  },
  "testPathIgnorePatterns": [
    'utils.ts',
  ]
  // moduleDirectories: ['node_modules', 'src'],
};
