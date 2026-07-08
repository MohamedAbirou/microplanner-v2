-- PM tool sync fields on Task (Todoist, Linear, Notion, Jira, Asana).
-- All additive, nullable, and backward-compatible — safe to deploy while the
-- app is live. See docs/PRODUCTION_READINESS.md for the deploy runbook.

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "externalSource" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "externalSyncedAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "integrationId" TEXT;

-- One MicroPlanner task per external item per user. Postgres treats NULLs as
-- distinct, so native (non-imported) tasks with NULL externalId/Source are
-- never blocked by this constraint.
CREATE UNIQUE INDEX IF NOT EXISTS "Task_userId_externalSource_externalId_key"
  ON "Task" ("userId", "externalSource", "externalId");

CREATE INDEX IF NOT EXISTS "Task_integrationId_idx"
  ON "Task" ("integrationId");

-- Keep imported tasks when the owning integration is disconnected.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Task_integrationId_fkey'
  ) THEN
    ALTER TABLE "Task"
      ADD CONSTRAINT "Task_integrationId_fkey"
      FOREIGN KEY ("integrationId") REFERENCES "Integration"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
