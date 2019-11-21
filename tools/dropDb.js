const { execSync } = require("child_process");
const config = require("../src/config");
const logger = require("../src/config/logger");

try {
  logger.debug("Dropping database...");
  execSync(`sudo -u postgres psql -c "DROP DATABASE ${config.dbName};"`);
  execSync(`sudo -u postgres psql -c "DROP ROLE ${config.dbUser};"`);
  logger.debug("Dropped database.");
} catch (error) {
  logger.error(error);
}
