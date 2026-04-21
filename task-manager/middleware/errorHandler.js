const AppError = require('../utils/AppError');

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages.join('. '), 422);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpired = () =>
  new AppError('Token expired. Please log in again.', 401);

// Status code → human-readable status string
const statusText = (code) => {
  if (code >= 500) return 'error';
  if (code >= 400) return 'fail';
  return 'success';
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = Object.assign(new AppError(err.message, err.statusCode || 500), err);

  if (err.name === 'CastError')         error = handleCastError(err);
  if (err.code === 11000)               error = handleDuplicateKey(err);
  if (err.name === 'ValidationError')   error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;

  // Never leak internals in production
  const isProd = process.env.NODE_ENV === 'production';
  const isOperational = error.isOperational === true;

  res.status(statusCode).json({
    status: statusText(statusCode),
    message: isProd && !isOperational ? 'Something went wrong.' : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
