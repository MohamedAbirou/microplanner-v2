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

function ConnectionRow({ connection }: { connection: CalendarConnection }) {
  const { syncCalendar, loading: syncing } = useSyncCalendarConnection();
  const { disconnectCalendar, loading: disconnecting } = useDisconnectCalendarConnection();

  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
          G
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-medium">
            {connection.email || 'Google Calendar'}
            <Badge variant={connection.isActive ? 'default' : 'secondary'}>
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
  const { connections, loading } = useCalendarConnections();
  const { initiateAuth, loading: initiating } = useInitiateCalendarAuth();

  const handleConnect = async () => {
    try {
      const { data } = await initiateAuth({ variables: { provider: 'GOOGLE' } });
      const authUrl = data?.initiateCalendarAuth?.authUrl;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toast.error('Could not start Google authorization');
      }
    } catch (error: any) {
      toast.error('Could not start Google authorization', { description: error?.message });
    }
  };

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </CardTitle>
        <CardDescription className="text-[13px]">
          Two-way sync — scheduled tasks appear as events, and your busy time is respected during planning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Skeleton className="h-[74px] w-full rounded-[10px]" />
        ) : connections.length > 0 ? (
          connections.map((connection: CalendarConnection) => (
            <ConnectionRow key={connection.id} connection={connection} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[10px] border border-dashed border-border p-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              No calendar connected yet. Connect Google Calendar to sync your schedule.
            </p>
            <Button onClick={handleConnect} disabled={initiating}>
              {initiating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="mr-2 h-4 w-4" />
              )}
              Connect Google Calendar
            </Button>
          </div>
        )}

        {connections.length > 0 && (
          <Button variant="outline" className="w-full" onClick={handleConnect} disabled={initiating}>
            {initiating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Connect another calendar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
