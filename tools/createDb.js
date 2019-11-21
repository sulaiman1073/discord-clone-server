const { execSync } = require("child_process");
const { Joi } = require("celebrate");
const config = require("../src/config");
const logger = require("../src/config/logger");

const schema = Joi.object({
  dbHost: Joi.string().required(),
  dbPort: Joi.number().required(),
  dbName: Joi.string().required(),
  dbUser: Joi.string().required(),
  dbPassword: Joi.string().required()
}).required();

const { error: validationError } = Joi.validate(
  {
    dbHost: config.dbHost,
    dbPort: config.dbPort,
    dbName: config.dbName,
    dbUser: config.dbUser,
    dbPassword: config.dbPassword
  },
  schema
);

if (validationError) {
  logger.error(validationError);
  throw new Error("Bad database info");
}

try {
  logger.debug("Creating database...");
  execSync(`sudo -u postgres psql -c "CREATE DATABASE ${config.dbName};"`);
  execSync(
    `sudo -u postgres psql -c "CREATE USER ${config.dbUser} WITH ENCRYPTED PASSWORD '${config.dbPassword}';"`
  );
  execSync(
    `sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${config.dbName} TO ${config.dbUser};"`
  );
  execSync(`sudo -u postgres psql -c "ALTER ROLE ${config.dbUser} superuser;"`);
  logger.debug("Created database.");
} catch (error) {
  logger.error(error);
}
