const httpStatus = require("http-status");

module.exports = async (res, err) => {
  res.status(err.statusCode).json({
    code: err.statusCode,
    error: httpStatus[err.statusCode],
    message: err.message
  });
};
