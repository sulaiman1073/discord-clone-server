const config = require("./config");

if (config.mode !== "production") {
  require("./helpers/createProjectDirectories");
}
const { app } = require("./app");
const logger = require("./config/logger");

let server;
if (config.mode !== "testing") {
  server = app.listen(config.port || 4000, config.host || "localhost", () => {
    logger.info(
      `Server is running at ${server.address().address}:${
        server.address().port
      } in ${app.get("env")} mode`
    );
  });
}

if (config.mode === "production") {
  require("./helpers/gracefulExit")(server);
}
