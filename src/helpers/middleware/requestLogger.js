const logger = require("../../config/logger");

module.exports = (req, res, next) => {
  res.on("finish", () => {
    logger.info({
      req: {
        id: req.id,
        remoteAddress: req.ip,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        user: req.user,
        headers: req.headers
      },
      res: {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.getHeaders()
      },
      ...(req.err && {
        err: req.err
      })
    });
  });

  next();
};
