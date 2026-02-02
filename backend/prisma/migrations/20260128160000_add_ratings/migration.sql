-- Add ratings and user aggregates

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ratings" (
  "id" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "comment" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tradeId" TEXT NOT NULL,
  "raterId" TEXT NOT NULL,
  "rateeId" TEXT NOT NULL,
  CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ratings_tradeId_raterId_key" ON "ratings"("tradeId", "raterId");
CREATE INDEX IF NOT EXISTS "ratings_rateeId_idx" ON "ratings"("rateeId");

ALTER TABLE "ratings"
ADD CONSTRAINT "ratings_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trade_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ratings"
ADD CONSTRAINT "ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ratings"
ADD CONSTRAINT "ratings_rateeId_fkey" FOREIGN KEY ("rateeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
