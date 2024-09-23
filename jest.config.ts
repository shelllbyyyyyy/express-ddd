import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  testEnvironment: "node",
  setupFilesAfterEnv: ["./test/libs/mock/redis-mock.ts"],
  testSequencer: "./test/libs/config/custom.test.sequential.ts",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/test/.+\\.controller\\.spec\\.ts$"],
};

export default jestConfig;
