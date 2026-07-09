'use client';

import * as React from 'react';
import { Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useCalendarConnections,
  useDisconnectCalendarConnection,
  useInitiateCalendarAuth,
  useSyncCalendarConnection,
} from '@/hooks/use-graphql-extended';
import { toast } from 'sonner';

interface CalendarConnection {
  id: string;
  provider: string;
  email?: string | null;
  isActive?: boolean | null;
  lastSyncedAt?: string | null;
  syncErrors?: string[] | null;
}

function formatSyncedAt(value?: string | null): string {
  if (!value) return 'Never synced';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never synced';
  return `Last synced ${date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

const PROVIDER_META: Record<string, { label: string; initial: string; color: string }> = {
  GOOGLE: { label: 'Google Calendar', initial: 'G', color: 'bg-blue-500' },
  OUTLOOK: { label: 'Outlook Calendar', initial: 'O', color: 'bg-sky-700' },
};

function ConnectionRow({ connection }: { connection: CalendarConnection }) {
  const { syncCalendar, loading: syncing } = useSyncCalendarConnection();
  const { disconnectCalendar, loading: disconnecting } = useDisconnectCalendarConnection();
  const meta = PROVIDER_META[(connection.provider || 'GOOGLE').toUpperCase()] || PROVIDER_META.GOOGLE;

  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ${meta.color}`}>
          {meta.initial}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 font-medium">
            <span className="min-w-0 truncate">{connection.email || meta.label}</span>
            <Badge variant={connection.isActive ? 'default' : 'secondary'} className="flex-none">
              {connection.isActive ? 'Connected' : 'Paused'}
            </Badge>
          </div>
          <div className="truncate text-[13px] text-muted-foreground">{formatSyncedAt(connection.lastSyncedAt)}</div>
          {connection.syncErrors && connection.syncErrors.length > 0 && (
            <div className="truncate text-[13px] text-destructive">{connection.syncErrors[0]}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={syncing}
          onClick={() => syncCalendar({ variables: { id: connection.id } })}
        >
          {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span className="ml-1.5 hidden sm:inline">Sync now</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Disconnect
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[14px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect calendar?</AlertDialogTitle>
              <AlertDialogDescription>
                MicroPlanner will stop syncing tasks and reading busy times from{' '}
                {connection.email || 'this calendar'}. You can reconnect anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep connected</AlertDialogCancel>
              <AlertDialogAction
                disabled={disconnecting}
                onClick={() => disconnectCalendar({ variables: { id: connection.id } })}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function CalendarSyncCard() {
  const { connections, loading, refetch } = useCalendarConnections();
  const { initiateAuth, loading: initiating } = useInitiateCalendarAuth();
  const [pending, setPending] = React.useState<string | null>(null);

  // After OAuth, the api-gateway callback redirects here with a status query param.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('calendar_connected');
    const oauthError = params.get('calendar_error');
    if (!connected && !oauthError) return;

    if (connected) {
      const label = PROVIDER_META[connected.toUpperCase()]?.label || connected;
      toast.success(`${label} connected`);
      refetch?.();
    } else if (oauthError) {
      toast.error('Calendar connection failed', { description: oauthError });
    }
    window.history.replaceState({}, '', '/integrations');
  }, [refetch]);

  const connectedProviders = new Set(
    (connections || []).map((c: CalendarConnection) => (c.provider || '').toUpperCase()),
  );

  const handleConnect = async (provider: 'GOOGLE' | 'OUTLOOK') => {
    const label = PROVIDER_META[provider]?.label || provider;
    setPending(provider);
    try {
      const { data } = await initiateAuth({ variables: { provider } });
      const authUrl = data?.initiateCalendarAuth?.authUrl;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toast.error(`Could not start ${label} authorization`);
        setPending(null);
      }
    } catch (error: any) {
      toast.error(`Could not start ${label} authorization`, { description: error?.message });
      setPending(null);
    }
  };

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <Calendar className="h-5 w-5" />
          Calendars
        </CardTitle>
        <CardDescription className="text-[13px]">
          Two-way sync — scheduled tasks appear as events, and your busy time (Google & Outlook) is
          respected during planning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Skeleton className="h-[74px] w-full rounded-[10px]" />
        ) : (
          <>
            {connections.map((connection: CalendarConnection) => (
              <ConnectionRow key={connection.id} connection={connection} />
            ))}

            <div className="grid gap-2 sm:grid-cols-2">
              {(['GOOGLE', 'OUTLOOK'] as const).map((provider) => {
                const meta = PROVIDER_META[provider];
                const already = connectedProviders.has(provider);
                return (
                  <Button
                    key={provider}
                    variant="outline"
                    className="w-full"
                    disabled={initiating && pending === provider}
                    onClick={() => handleConnect(provider)}
                  >
                    {initiating && pending === provider ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    {already ? `Reconnect ${meta.label}` : `Connect ${meta.label}`}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
