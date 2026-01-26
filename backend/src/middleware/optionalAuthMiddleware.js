// backend/src/middleware/optionalAuthMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Optional Authentication Middleware
 * - Si hay token válido -> setea req.user = { id }
 * - Si no hay token o es inválido -> continúa sin bloquear
 */
const optionalAuthenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: decoded.userId };
  } catch (_err) {
    // Token inválido/expirado: no bloqueamos, solo seguimos sin req.user
  }

  return next();
};

module.exports = optionalAuthenticate;