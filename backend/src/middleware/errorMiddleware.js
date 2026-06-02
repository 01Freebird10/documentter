import ApiResponse from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Internal Server Gateway Error';
  error.statusCode = err.statusCode || 500;

  // Log details during development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR LOG] ${err.stack}`);
  }

  // 1. Mongoose Bad ObjectId casting error
  if (err.name === 'CastError') {
    const msg = `Resource not found with parsed identifier: ${err.value}`;
    return ApiResponse.error(res, msg, 404);
  }

  // 2. Mongoose duplicate fields index key error (e.g., email overlap)
  if (err.code === 11000) {
    const msg = 'Email address is already registered. Please login or try another email.';
    return ApiResponse.error(res, msg, 400);
  }

  // 3. Mongoose validation rules errors
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(val => val.message).join(', ');
    return ApiResponse.error(res, msg, 400);
  }

  // 4. JWT invalid credentials error
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Authentication failed. Access token is invalid.', 401);
  }

  // 5. JWT token expiration error
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Access session expired. Please refresh session credentials.', 401);
  }

  // Fallback unified response
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    data: null
  });
};

export default errorHandler;
