class DatabaseError extends Error {
  constructor(
    message,
    code,
    codeName,
    detail,
    hint,
    position,
    where,
    schema,
    table,
    column,
    dataType,
    constraint
  ) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.code = code;
    this.codeName = codeName;
    this.detail = detail;
    this.hint = hint;
    this.position = position;
    this.where = where;
    this.schema = schema;
    this.table = table;
    this.column = column;
    this.dataType = dataType;
    this.constraint = constraint;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = DatabaseError;
