'use client';

import * as React from 'react';
import { Calendar, Zap, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Integrations Page
 *
 * Calendar sync is not yet available to end users, so we present it honestly
 * as "Coming soon" rather than shipping mock connect flows. When real Google
 * OAuth is wired end-to-end (backend service exists), restore the connect UI.
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
            Calendar Sync
          </TabsTrigger>
          <TabsTrigger value="api">
            <Zap className="h-4 w-4 mr-2" />
            API &amp; Webhooks
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        {/* Calendar Sync Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Calendar Sync</CardTitle>
              <CardDescription>
                Two-way sync between MicroPlanner and Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Google Calendar sync is in the works — scheduled tasks will appear as
                  calendar events and your busy time will be respected during planning.
                  We&apos;ll let you know the moment it&apos;s ready.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Use the MicroPlanner API to build custom integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  API access and webhooks will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Data Import/Export</CardTitle>
              <CardDescription>
                Import or export your data in various formats
              </CardDescription>
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
