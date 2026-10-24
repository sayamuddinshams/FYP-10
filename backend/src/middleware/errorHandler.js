import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  return errorResponse(res, message, statusCode);
}

export function notFoundHandler(req, res) {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} not found`, 404);
}
