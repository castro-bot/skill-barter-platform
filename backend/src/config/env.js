// backend/src/config/env.js
require('dotenv').config();

const config = {
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validation: Fail fast if critical config is missing
if (!config.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not defined in .env');
}

module.exports = config;