const Redis = require("ioredis");
const config = require("./index");

const redis = new Redis({
  host: config.redisHost || "localhost",
  port: config.redisPort || 6379,
  db: config.redisIndex || 0,
  password: config.redisPassword || null
});

module.exports = redis;
