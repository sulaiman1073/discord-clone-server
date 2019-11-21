const redis = require("../../config/redis");
const isJson = require("../../utils/isJson");

const cache = async (req, res, next) => {
  const key = `API:${req.originalUrl}`;
  const val = await redis.get(key);

  if (val) {
    if (isJson(val)) {
      res.json(JSON.parse(val));
    } else {
      res.send(val);
    }
  } else {
    res.sendResponse = res.send;
    res.jsonResponse = res.json;

    res.send = async body => {
      const timeout = res.statusCode >= 200 && res.statusCode < 300 ? 3600 : 20;
      await redis.setex(key, timeout, body);
      res.sendResponse(body);
    };

    res.json = async body => {
      const timeout = res.statusCode >= 200 && res.statusCode < 300 ? 3600 : 20;
      await redis.setex(key, timeout, body);
      res.jsonResponse(body);
    };

    next();
  }
};

const invalidateCache = async (req, res, next) => {
  const key = `API:${req.originalUrl}`;

  res.sendResponse = res.send;
  res.jsonResponse = res.json;

  res.send = async body => {
    await redis.del(key);
    res.sendResponse(body);
  };

  res.json = async body => {
    await redis.del(key);
    res.jsonResponse(body);
  };

  next();
};

module.exports = { cache, invalidateCache };
