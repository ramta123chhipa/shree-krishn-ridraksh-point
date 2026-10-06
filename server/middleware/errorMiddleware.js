import ApiError from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Centralized error handler: every error ends up here.
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller' : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Too many images in one upload' : err.message;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue).join(', ')}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
