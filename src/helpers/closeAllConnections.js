const database = require("../config/database");
const redis = require("../config/redis");

module.exports = async () => {
  await database.end();
  await redis.quit();
};
