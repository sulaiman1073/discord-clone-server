const { existsSync, mkdirSync } = require("fs");
const { resolve } = require("path");
const config = require("../config");

if (!existsSync(resolve(process.cwd(), "./public"))) {
  mkdirSync(resolve(process.cwd(), "./public"), { recursive: true });
}
if (!existsSync(config.logsPathDev)) {
  mkdirSync(config.logsPathDev, { recursive: true });
}
