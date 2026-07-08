'use client';

import * as React from 'react';
import { Calendar, Zap, Database, LayoutGrid, Webhook } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarSyncCard } from '@/components/calendar/calendar-sync-card';
import { IntegrationsHub } from '@/components/integrations/integrations-hub';
import { WebhooksManager } from '@/components/integrations/webhooks-manager';
import { TierGate } from '@/components/tier-gate';

/**
 * Integrations Page — calendar sync, third-party app connections, and webhooks.
 */

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto mp-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Connect MicroPlanner with your favorite tools and services
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="apps">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Apps
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        {/* Calendar Sync Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <CalendarSyncCard />
        </TabsContent>

        {/* Apps Tab */}
        <TabsContent value="apps" className="space-y-6">
          <IntegrationsHub />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <TierGate
            requiredTier="PREMIUM"
            feature="Webhooks"
            fallback={
              <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
                <CardHeader>
                  <CardTitle>Webhooks are a Premium feature</CardTitle>
                  <CardDescription>
                    Upgrade to Premium to receive real-time event callbacks and manage API keys.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/settings?tab=billing">Upgrade to Premium</Link>
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <WebhooksManager />
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertTitle>Looking for API keys?</AlertTitle>
              <AlertDescription>
                Create and manage API keys in{' '}
                <Link href="/settings" className="underline">
                  Settings → API
                </Link>
                .
              </AlertDescription>
            </Alert>
          </TierGate>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Data Import/Export</CardTitle>
              <CardDescription>Import or export your data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Export Available</AlertTitle>
                <AlertDescription>
                  Data export is available in Settings → Privacy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
