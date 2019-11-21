const logger = require("../config/logger");
const closeAllConnections = require("../helpers/closeAllConnections");

module.exports = server => {
  process.on("SIGINT", () => {
    logger.info("SIGINT signal received.");

    server.close(async () => {
      await closeAllConnections();
      logger.info("Closing server...");
      process.exit(0);
    });

    setTimeout(() => {
      logger.info("Forcefully closing server...");
      process.exit(1);
    }, 10000);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received.");

    server.close(async () => {
      await closeAllConnections();
      logger.info("Closing server...");
      process.exit(0);
    });

    setTimeout(() => {
      logger.info("Forcefully closing server...");
      process.exit(1);
    }, 10000);
  });

  process.on("uncaughtException", async error => {
    logger.error(error);

    server.close(async () => {
      await closeAllConnections();
      logger.info("Closing server...");
      process.exit(1);
    });

    setTimeout(() => {
      logger.info("Forcefully closing server...");
      process.exit(1);
    }, 10000);
  });

  process.on("unhandledRejection", async error => {
    logger.error(error);

    server.close(async () => {
      await closeAllConnections();
      logger.info("Closing server...");
      process.exit(1);
    });

    setTimeout(() => {
      logger.info("Forcefully closing server...");
      process.exit(1);
    }, 10000);
  });

  process.on("warning", warning => {
    logger.warn(warning);
  });
};
