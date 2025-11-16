'use client';

import * as React from 'react';
import { Calendar, Check, RefreshCw, Unplug, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Calendar Sync Card Component
 *
 * Handles OAuth connection flows for:
 * - Google Calendar
 * - Microsoft Outlook
 * - Apple iCloud Calendar
 */

export type CalendarProvider = 'GOOGLE' | 'OUTLOOK' | 'APPLE';

interface CalendarIntegration {
  provider: CalendarProvider;
  email?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

interface CalendarSyncCardProps {
  provider: CalendarProvider;
  integration?: CalendarIntegration;
  onConnect: (provider: CalendarProvider) => void;
  onDisconnect: (provider: CalendarProvider) => void;
  onSync: (provider: CalendarProvider) => void;
  isConnecting?: boolean;
  isDisconnecting?: boolean;
  isSyncing?: boolean;
}

const providerConfig = {
  GOOGLE: {
    name: 'Google Calendar',
    icon: '🗓️',
    color: 'bg-blue-500',
    description: 'Sync with Google Calendar',
    oauthUrl: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL || '/api/auth/google',
  },
  OUTLOOK: {
    name: 'Microsoft Outlook',
    icon: '📅',
    color: 'bg-blue-600',
    description: 'Sync with Outlook Calendar',
    oauthUrl: process.env.NEXT_PUBLIC_OUTLOOK_OAUTH_URL || '/api/auth/outlook',
  },
  APPLE: {
    name: 'Apple iCloud',
    icon: '🍎',
    color: 'bg-gray-700',
    description: 'Sync with iCloud Calendar',
    oauthUrl: process.env.NEXT_PUBLIC_APPLE_OAUTH_URL || '/api/auth/apple',
  },
};

export function CalendarSyncCard({
  provider,
  integration,
  onConnect,
  onDisconnect,
  onSync,
  isConnecting,
  isDisconnecting,
  isSyncing,
}: CalendarSyncCardProps) {
  const config = providerConfig[provider];
  const isConnected = integration?.isConnected || false;

  const handleConnect = () => {
    // Open OAuth flow in popup window
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const popup = window.open(
      config.oauthUrl,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth_success' && event.data.provider === provider) {
        const authCode = event.data.code;
        onConnect(provider);
        popup?.close();
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'oauth_error') {
        toast.error('Failed to connect calendar', {
          description: event.data.error,
        });
        popup?.close();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const handleDisconnect = () => {
    if (confirm(`Are you sure you want to disconnect ${config.name}?`)) {
      onDisconnect(provider);
    }
  };

  const handleSync = () => {
    onSync(provider);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                config.color
              )}
            >
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected && integration && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium">{integration.email}</span>
              </div>
              {integration.lastSyncedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last synced:</span>
                  <span className="font-medium">
                    {format(new Date(integration.lastSyncedAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-destructive hover:text-destructive"
              >
                {isDisconnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unplug className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {isConnected && (
          <p className="text-xs text-muted-foreground">
            MicroPlanner will automatically sync your tasks with {config.name} every hour.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
