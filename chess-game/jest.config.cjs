/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest", // Use ts-jest to handle TypeScript files
    testEnvironment: "node", // Set the environment to Node.js
    moduleFileExtensions: ["ts", "js"], // Allow both TypeScript and JavaScript files
    testMatch: ["**/*.test.ts"], // Match test files ending with .test.ts
    verbose: true, // Show detailed test results
  };
  