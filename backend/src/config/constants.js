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

module.exports = {
  TOKEN_EXPIRATION,
  COOKIE_SETTINGS,
};