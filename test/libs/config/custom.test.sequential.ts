// eslint-disable-next-line @typescript-eslint/no-require-imports
const TestSequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    return tests.sort((a, b) => {
      const aDir = a.path.split("/").slice(0, -1).join("/");
      const bDir = b.path.split("/").slice(0, -1).join("/");

      if (aDir < bDir) return -1;
      if (aDir > bDir) return 1;

      return a.path.localeCompare(b.path);
    });
  }
}

module.exports = CustomSequencer;
