const { openSync, closeSync } = require("fs");
const { resolve } = require("path");
const { hostname } = require("os");
const l0gg3r = require("l0gg3r");

const { transports, serializers } = l0gg3r;
const config = require(".");
const pii = require("./pii");

let logger;

const formatPii = p => {
  const newPii = [];

  p.forEach(str => {
    newPii.push(`req.body.${str}`);
    newPii.push(`req.user.${str}`);
  });

  return newPii;
};

if (config.mode === "production") {
  logger = l0gg3r({
    transports: [
      transports.consoleTransport({
        level: "info",
        serializer: serializers.json({
          redact: formatPii(pii),
          meta: {
            pid: process.pid,
            hostname: hostname()
          }
        })
      })
    ]
  });
} else {
  const logFile = resolve(config.logsPathDev, "./logs.log");
  closeSync(openSync(logFile, "a"));

  logger = l0gg3r({
    transports: [
      transports.consoleTransport({
        level: "debug",
        serializer: serializers.prettyConsole()
      }),
      transports.fileTransport({
        level: "debug",
        serializer: serializers.prettyFile(),
        file: logFile
      })
    ]
  });
}

module.exports = logger;
