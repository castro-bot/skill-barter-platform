const TOKEN_EXPIRATION = {
  ACCESS: '15m',
  REFRESH: '7d',
};

const COOKIE_SETTINGS = {
  HTTP_ONLY: true,
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'strict',
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

module.exports = {
  TOKEN_EXPIRATION,
  COOKIE_SETTINGS,
};