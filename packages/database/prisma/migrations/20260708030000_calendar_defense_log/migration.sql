-- Calendar-defense action log. Additive.
CREATE TABLE IF NOT EXISTS "CalendarDefenseLog" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "eventId"    TEXT NOT NULL,
  "provider"   TEXT NOT NULL,
  "action"     TEXT NOT NULL,
  "eventTitle" TEXT NOT NULL,
  "eventStart" TIMESTAMP(3) NOT NULL,
  "reason"     TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CalendarDefenseLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CalendarDefenseLog_userId_eventId_action_key"
  ON "CalendarDefenseLog" ("userId", "eventId", "action");
CREATE INDEX IF NOT EXISTS "CalendarDefenseLog_userId_createdAt_idx"
  ON "CalendarDefenseLog" ("userId", "createdAt");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CalendarDefenseLog_userId_fkey') THEN
    ALTER TABLE "CalendarDefenseLog" ADD CONSTRAINT "CalendarDefenseLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
