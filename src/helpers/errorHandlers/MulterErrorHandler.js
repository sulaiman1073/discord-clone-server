const httpStatus = require("http-status");

module.exports = async (res, err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(501).json({
      code: 501,
      error: httpStatus[501],
      message: err.message,
      ...(err.field && { field: err.field })
    });
  } else {
    res.status(400).json({
      code: 400,
      error: httpStatus[400],
      message: err.message,
      ...(err.field && { field: err.field })
    });
  }
};
