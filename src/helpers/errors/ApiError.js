class ApiError extends Error {
  constructor(message = "Api Error", statusCode = 500, cause) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = statusCode;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
