-- Align DB with Prisma schema (Sprint)
-- Adds missing columns that were present in schema but not in DB.

-- 1) users.role
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'USER';

-- 2) service_listings soft-delete fields
ALTER TABLE "service_listings"
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "service_listings"
ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP;
