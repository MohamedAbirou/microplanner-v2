-- Guided daily ritual (cross-device intention/reflection). Additive.
CREATE TABLE IF NOT EXISTS "DailyRitual" (
  "id"            TEXT NOT NULL,
  "userId"        TEXT NOT NULL,
  "date"          TIMESTAMP(3) NOT NULL,
  "intention"     TEXT,
  "reflection"    TEXT,
  "planCompleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyRitual_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DailyRitual_userId_date_key" ON "DailyRitual" ("userId", "date");
CREATE INDEX IF NOT EXISTS "DailyRitual_userId_idx" ON "DailyRitual" ("userId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyRitual_userId_fkey') THEN
    ALTER TABLE "DailyRitual" ADD CONSTRAINT "DailyRitual_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
