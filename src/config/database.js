const { Pool } = require("pg");
const config = require(".");

const dbPool = new Pool({
  host: config.dbHost || "localhost",
  port: config.dbPort || 5432,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword
});

module.exports = dbPool;
