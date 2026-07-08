-- Calendar push-notification watch channels (Google events.watch / Graph subscriptions).
-- Enables near-real-time autopilot rescheduling in place of the 5-minute poll.

ALTER TABLE "CalendarToken"
  ADD COLUMN "watchChannelId" TEXT,
  ADD COLUMN "watchResourceId" TEXT,
  ADD COLUMN "graphSubscriptionId" TEXT,
  ADD COLUMN "watchExpiration" TIMESTAMP(3),
  ADD COLUMN "watchClientState" TEXT;

CREATE INDEX "CalendarToken_watchChannelId_idx" ON "CalendarToken"("watchChannelId");
CREATE INDEX "CalendarToken_graphSubscriptionId_idx" ON "CalendarToken"("graphSubscriptionId");
