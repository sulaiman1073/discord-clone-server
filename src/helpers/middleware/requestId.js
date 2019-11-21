const uuidv4 = require("uuid/v4");

module.exports = () => (req, res, next) => {
  req.id = uuidv4();
  next();
};
