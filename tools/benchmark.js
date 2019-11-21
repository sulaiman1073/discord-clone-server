const { spawn, spawnSync } = require("child_process");
const { readdir } = require("fs");
const { resolve } = require("path");
const resetDb = require("../src/helpers/resetDb");

const testsDirectory = resolve(__dirname, "../benchmarks/tests/");
const serverPath = resolve(__dirname, "../src/index.js");

const server = spawn("node", [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    BENCHMARK: true
  }
});

setTimeout(() => {
  readdir(testsDirectory, async (err, files) => {
    await resetDb();
    for (const file of files) {
      spawnSync("node", [resolve(testsDirectory, file)], {
        stdio: "inherit"
      });
    }
    await resetDb();
    server.kill();
  });
}, 1000);
