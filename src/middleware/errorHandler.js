const AppError = require('../utils/AppError');

exports.notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

exports.errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  if (err.name === 'CastError') error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  else if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    error = new AppError('Validation failed', 400, details);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value for ${field}`, 409);
  } else if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token', 401);
  else if (err.name === 'TokenExpiredError') error = new AppError('Token expired, please log in again', 401);
  else if (err.type === 'entity.parse.failed') error = new AppError('Malformed JSON in request body', 400);

  const statusCode = error.statusCode || 500;
  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: error.isOperational ? error.message : 'Internal server error',
    ...(error.details && { errors: error.details }),
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  });
};
