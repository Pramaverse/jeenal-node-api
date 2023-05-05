/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  maxConcurrency: 1,
  maxWorkers: 1,
  testMatch: ["**/*.spec.ts"],
  testTimeout: 60000,
};
