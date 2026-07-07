-- Composite indexes for hot Task query paths (production-scale audit 2026-07-07).
-- All additive and idempotent. On a large production table these should be
-- created with CREATE INDEX CONCURRENTLY during a maintenance window to avoid
-- locking writes; Prisma runs migrations in a transaction so CONCURRENTLY is
-- not used here. See docs/PRODUCTION_READINESS.md for the ops runbook.

-- Completion analytics: weekly-completed counts + streak scans
-- (WHERE userId = ? AND isCompleted = true AND completedAt BETWEEN ...).
CREATE INDEX IF NOT EXISTS "Task_userId_isCompleted_completedAt_idx"
  ON "Task" ("userId", "isCompleted", "completedAt");

-- Goal task fetch / goal analytics: WHERE goalId = ? ORDER BY scheduledDate.
CREATE INDEX IF NOT EXISTS "Task_goalId_scheduledDate_idx"
  ON "Task" ("goalId", "scheduledDate");
