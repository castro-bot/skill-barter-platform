// backend/src/middleware/errorMiddleware.js
/**
 * Global Error Handler Middleware
 * Guideline #9: Error Handling - Standardize error responses.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for the developer (you)
  console.error(`[Error] ${err.message}`);

  // Default to 500 if status code is not set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;