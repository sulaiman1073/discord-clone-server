/* eslint-disable no-empty */
/* eslint-disable no-console */
require("../src/helpers/createProjectDirectories");
const { resolve } = require("path");
const rimraf = require("rimraf");
const redis = require("../src/config/redis");
const resetDb = require("../src/helpers/resetDb");
const closeAllConnections = require("../src/helpers/closeAllConnections");

const reset = async () => {
  console.log("Resetting server...");
  const publicDirectory = resolve(process.cwd(), "./public");
  const logsDirectory = resolve(process.cwd(), "./logs");
  const coverageDirectory = resolve(process.cwd(), "./coverage");

  await redis.flushall();
  await resetDb();
  await closeAllConnections();

  rimraf.sync(publicDirectory);
  rimraf.sync(logsDirectory);
  rimraf.sync(coverageDirectory);

  console.log("Resetted server.");
};

reset();
