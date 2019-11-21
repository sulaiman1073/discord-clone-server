const errorCodes = require("pg-error-codes");
const { DatabaseError } = require("./errors");

module.exports = error =>
  new DatabaseError(
    error.message,
    error.code,
    errorCodes[error.code],
    error.detail,
    error.hint,
    error.position,
    error.where,
    error.schema,
    error.table,
    error.column,
    error.dataType,
    error.constraint
  );
