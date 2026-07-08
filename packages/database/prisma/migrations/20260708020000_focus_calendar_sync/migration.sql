-- Focus block -> calendar sync bookkeeping. Additive, backward-compatible.
ALTER TABLE "FocusTimeBlock" ADD COLUMN IF NOT EXISTS "calendarEventId" TEXT;
ALTER TABLE "FocusTimeBlock" ADD COLUMN IF NOT EXISTS "calendarProvider" TEXT;
ALTER TABLE "FocusTimeBlock" ADD COLUMN IF NOT EXISTS "calendarSyncSig" TEXT;
ALTER TABLE "FocusTimeBlock" ADD COLUMN IF NOT EXISTS "calendarSyncedAt" TIMESTAMP(3);
