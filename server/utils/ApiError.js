// Error with an HTTP status code, thrown from controllers/services.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ApiError;
