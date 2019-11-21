const httpStatus = require("http-status");

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({
    code: 401,
    error: httpStatus[401],
    message: "Unauthenticated session"
  });
};
