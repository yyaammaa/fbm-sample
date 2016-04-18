'use strict';

const gulp = require('gulp');
const jest = require('jest-cli');
const runSequence = require('run-sequence');

const jestOptions = {
  collectCoverage: true,
  rootDir: '.',
  testPathDirs: ["<rootDir>/"],
  unmockedModulePathPatterns: ["<rootDir>/node_modules/"],
  // scriptPreprocessor: "<rootDir>/node_modules/babel-jest",
  testFileExtensions: ["es6", "js"],
  moduleFileExtensions: ["js", "json", "es6"]
};
gulp.task('jest', (callback) => {
  const onComplete = (result) => {
    callback();
  };

  jest.runCLI({config: jestOptions}, __dirname, onComplete);
});