// backend/src/core/db.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });

// Create adapter for Prisma 7
const adapter = new PrismaPg(pool);

// Instantiate Prisma Client with adapter (required in Prisma 7)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
