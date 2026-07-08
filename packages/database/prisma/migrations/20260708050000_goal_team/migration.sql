-- Team-shared goals. Additive, nullable, backward-compatible.
ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "teamId" TEXT;
CREATE INDEX IF NOT EXISTS "Goal_teamId_idx" ON "Goal" ("teamId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Goal_teamId_fkey') THEN
    ALTER TABLE "Goal" ADD CONSTRAINT "Goal_teamId_fkey"
      FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
