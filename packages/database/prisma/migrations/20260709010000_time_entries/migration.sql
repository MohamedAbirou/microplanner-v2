-- Individual time-tracking entries (manual logs + stopped timers).
-- Task.timeSpentMinutes remains the running aggregate for fast reads.

CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimeEntry_taskId_idx" ON "TimeEntry"("taskId");
CREATE INDEX "TimeEntry_userId_startedAt_idx" ON "TimeEntry"("userId", "startedAt");

ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
