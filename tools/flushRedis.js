const redis = require("../src/config/redis");

const flushRedis = async () => {
  await redis.flushall();
  await redis.disconnect();
};

flushRedis();
