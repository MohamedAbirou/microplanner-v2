-- Flexible recurring habits (Reclaim-style). Additive.
CREATE TABLE IF NOT EXISTS "Habit" (
  "id"                   TEXT NOT NULL,
  "userId"               TEXT NOT NULL,
  "title"                TEXT NOT NULL,
  "daysOfWeek"           INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "preferredWindowStart" TEXT NOT NULL,
  "preferredWindowEnd"   TEXT NOT NULL,
  "durationMinutes"      INTEGER NOT NULL,
  "priority"             INTEGER NOT NULL DEFAULT 5,
  "flexible"             BOOLEAN NOT NULL DEFAULT true,
  "isActive"             BOOLEAN NOT NULL DEFAULT true,
  "color"                TEXT NOT NULL DEFAULT '#8B5CF6',
  "calendarEventId"      TEXT,
  "calendarProvider"     TEXT,
  "calendarSyncSig"      TEXT,
  "calendarSyncedAt"     TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Habit_userId_idx" ON "Habit" ("userId");
CREATE INDEX IF NOT EXISTS "Habit_isActive_idx" ON "Habit" ("isActive");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Habit_userId_fkey') THEN
    ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
