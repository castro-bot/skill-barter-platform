// backend/src/config/constants.js
const TOKEN_EXPIRATION = {
  ACCESS: '15m',
  REFRESH: '7d',
};

// CORRECCIÓN: Las claves deben ser 'httpOnly', 'secure', etc. (camelCase)
// Si usas MAYÚSCULAS, Express las ignora y la cookie falla.
const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // false en tu PC
  sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // 'Lax' es mejor para localhost
  path: '/', // Importante para que la cookie funcione en todas las rutas
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

// User roles (Clean Code: avoid magic strings)
const USER_ROLES = {
  REGULAR: 'USER',
  MODERATOR: 'MODERATOR',
};

// Centralized error messages (DRY principle)
const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_IN_USE: 'Email already in use',
  USER_NOT_FOUND: 'User not found',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_TOO_SHORT: 'New password must be at least 6 characters',

  // Services
  SERVICE_NOT_FOUND: 'Service not found',
  NOT_AUTHORIZED: 'Not authorized',
  NO_FIELDS_TO_UPDATE: 'No valid fields to update',

  // Trades
  TRADE_NOT_FOUND: 'Trade not found',
  CANNOT_TRADE_SELF: 'Cannot trade with yourself',
};

module.exports = {
  TOKEN_EXPIRATION,
  COOKIE_SETTINGS,
  USER_ROLES,
  ERROR_MESSAGES,
};