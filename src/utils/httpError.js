// src/utils/httpError.js · Error con código HTTP que el errorHandler respeta
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

module.exports = HttpError;
