'use client';

import * as React from 'react';
import { Calendar, Zap, Shield, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarSyncCard, CalendarProvider } from '@/components/integrations/calendar-sync-card';
import { useConnectCalendar, useDisconnectCalendar, useSyncCalendar } from '@/hooks/use-graphql';

/**
 * Integrations Page
 *
 * Manage external integrations:
 * - Calendar sync (Google, Outlook, Apple)
 * - Webhooks and APIs
 * - Data import/export
 */

interface CalendarIntegration {
  provider: CalendarProvider;
  email?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

export default function IntegrationsPage() {
  const { connectCalendar, loading: connecting } = useConnectCalendar();
  const { disconnectCalendar, loading: disconnecting } = useDisconnectCalendar();
  const { syncCalendar, loading: syncing } = useSyncCalendar();

  const [connectingProvider, setConnectingProvider] = React.useState<CalendarProvider | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = React.useState<CalendarProvider | null>(null);
  const [syncingProvider, setSyncingProvider] = React.useState<CalendarProvider | null>(null);

  // State to track calendar integrations (will be replaced with GraphQL query when available)
  const [integrations, setIntegrations] = React.useState<Record<CalendarProvider, CalendarIntegration>>({
    GOOGLE: {
      provider: 'GOOGLE',
      email: undefined,
      isConnected: false,
      lastSyncedAt: undefined,
    },
    OUTLOOK: {
      provider: 'OUTLOOK',
      email: undefined,
      isConnected: false,
      lastSyncedAt: undefined,
    },
    APPLE: {
      provider: 'APPLE',
      email: undefined,
      isConnected: false,
      lastSyncedAt: undefined,
    },
  });

  const handleConnect = async (provider: CalendarProvider) => {
    setConnectingProvider(provider);
    try {
      // Note: In real implementation, authCode comes from OAuth callback
      const result = await connectCalendar({
        variables: {
          provider,
          authCode: 'mock-auth-code', // Replace with actual code from OAuth
        },
      });

      // Update local state on successful connection
      if (result.data?.connectCalendar) {
        setIntegrations((prev) => ({
          ...prev,
          [provider]: {
            provider,
            email: result.data.connectCalendar.email,
            isConnected: true,
            lastSyncedAt: new Date().toISOString(),
          },
        }));
      }
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: CalendarProvider) => {
    setDisconnectingProvider(provider);
    try {
      await disconnectCalendar({
        variables: { provider },
      });

      // Update local state on successful disconnection
      setIntegrations((prev) => ({
        ...prev,
        [provider]: {
          provider,
          email: undefined,
          isConnected: false,
          lastSyncedAt: undefined,
        },
      }));
    } finally {
      setDisconnectingProvider(null);
    }
  };

  const handleSync = async (provider: CalendarProvider) => {
    setSyncingProvider(provider);
    try {
      await syncCalendar({
        variables: { provider },
      });

      // Update last synced time
      setIntegrations((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          lastSyncedAt: new Date().toISOString(),
        },
      }));
    } finally {
      setSyncingProvider(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">
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
            API & Webhooks
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        {/* Calendar Sync Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Secure Connection</AlertTitle>
            <AlertDescription>
              All calendar integrations use OAuth 2.0 for secure authentication. We never store your passwords.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CalendarSyncCard
              provider="GOOGLE"
              integration={integrations.GOOGLE}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              isConnecting={connectingProvider === 'GOOGLE'}
              isDisconnecting={disconnectingProvider === 'GOOGLE'}
              isSyncing={syncingProvider === 'GOOGLE'}
            />

            <CalendarSyncCard
              provider="OUTLOOK"
              integration={integrations.OUTLOOK}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              isConnecting={connectingProvider === 'OUTLOOK'}
              isDisconnecting={disconnectingProvider === 'OUTLOOK'}
              isSyncing={syncingProvider === 'OUTLOOK'}
            />

            <CalendarSyncCard
              provider="APPLE"
              integration={integrations.APPLE}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              isConnecting={connectingProvider === 'APPLE'}
              isDisconnecting={disconnectingProvider === 'APPLE'}
              isSyncing={syncingProvider === 'APPLE'}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How Calendar Sync Works</CardTitle>
              <CardDescription>
                Bi-directional sync between MicroPlanner and your calendars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium">Tasks to Calendar</p>
                    <p className="text-muted-foreground">
                      Scheduled tasks are automatically added as events to your connected calendars
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium">Calendar to Tasks</p>
                    <p className="text-muted-foreground">
                      Calendar events can be imported as tasks (optional)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-muted-foreground">
                      Changes sync automatically every hour, or manually trigger sync anytime
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
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
          <Card>
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
                  Data export is available in Settings → Data & Privacy
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
