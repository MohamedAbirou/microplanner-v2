-- Full-day autopilot: user settings + proposal/log table.
-- Additive and backward-compatible; safe to deploy live.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "autopilotEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "autopilotMode" TEXT NOT NULL DEFAULT 'SUGGEST';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "autopilotCalendarSig" TEXT;

CREATE TABLE IF NOT EXISTS "AutopilotProposal" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "date"      TIMESTAMP(3) NOT NULL,
  "mode"      TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'PENDING',
  "trigger"   TEXT,
  "summary"   TEXT NOT NULL,
  "moves"     JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  CONSTRAINT "AutopilotProposal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AutopilotProposal_userId_status_idx"
  ON "AutopilotProposal" ("userId", "status");
CREATE INDEX IF NOT EXISTS "AutopilotProposal_userId_createdAt_idx"
  ON "AutopilotProposal" ("userId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AutopilotProposal_userId_fkey'
  ) THEN
    ALTER TABLE "AutopilotProposal"
      ADD CONSTRAINT "AutopilotProposal_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
