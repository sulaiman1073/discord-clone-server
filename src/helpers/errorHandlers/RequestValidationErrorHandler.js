const httpStatus = require("http-status");
const escapeHtml = require("escape-html");

module.exports = async (res, err) => {
  const { joi, meta } = err;

  const result = {
    code: 400,
    error: httpStatus[400],
    message: joi.message,
    validation: {
      source: meta.source,
      keys: []
    }
  };

  if (joi.details) {
    for (let i = 0; i < joi.details.length; i += 1) {
      const path = joi.details[i].path.join(".");
      result.validation.keys.push(escapeHtml(path));
    }
  }
  return res.status(400).json(result);
};
