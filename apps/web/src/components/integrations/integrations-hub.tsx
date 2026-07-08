'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { MessageSquare, Video, FileText, Layers, Github, CheckSquare, SquareKanban, ListChecks, Check, Loader2, RefreshCw, AlertTriangle, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  useIntegrations,
  useInitiateIntegrationOAuth,
  useDisconnectIntegration,
  useSyncIntegration,
} from '@/hooks/use-graphql-extended';
import { IntegrationSettingsDialog } from './integration-settings-dialog';

interface AppDef {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// Only providers with a real OAuth backend are listed. Zapier has no backend
// support, so it is intentionally omitted rather than showing a fake connect.
const APPS: AppDef[] = [
  { type: 'TODOIST', name: 'Todoist', description: 'Import Todoist tasks and complete them in sync', icon: CheckSquare, color: '#E44332' },
  { type: 'LINEAR', name: 'Linear', description: 'Turn Linear issues into scheduled tasks', icon: Layers, color: '#5E6AD2' },
  { type: 'NOTION', name: 'Notion', description: 'Sync tasks from a Notion database', icon: FileText, color: '#000000' },
  { type: 'JIRA', name: 'Jira', description: 'Import assigned Jira issues; complete syncs back', icon: SquareKanban, color: '#0052CC' },
  { type: 'ASANA', name: 'Asana', description: 'Import Asana tasks assigned to you', icon: ListChecks, color: '#F06A6A' },
  { type: 'SLACK', name: 'Slack', description: 'Post your daily plan digest to a channel; /microplanner today', icon: MessageSquare, color: '#611f69' },
  { type: 'ZOOM', name: 'Zoom', description: 'Connect your Zoom account — meeting links coming soon', icon: Video, color: '#2D8CFF' },
  { type: 'GITHUB', name: 'GitHub', description: 'Connect GitHub — issue import coming soon', icon: Github, color: '#24292e' },
];

// Providers that support two-way task sync (import + complete-back + settings).
const PM_SYNC_TYPES = new Set(['TODOIST', 'LINEAR', 'NOTION', 'JIRA', 'ASANA']);
// OAuth connects but there is no import yet — be honest, don't show a fake Sync.
const OAUTH_ONLY_TYPES = new Set(['ZOOM', 'GITHUB']);

const APP_NAME_BY_TYPE = new Map(APPS.map((a) => [a.type, a.name]));

export function IntegrationsHub() {
  const { integrations, loading, refetch } = useIntegrations();
  const { initiateOAuth } = useInitiateIntegrationOAuth();
  const { disconnectIntegration } = useDisconnectIntegration();
  const { syncIntegration } = useSyncIntegration();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [settingsFor, setSettingsFor] = React.useState<any | null>(null);

  // Surface the OAuth callback outcome once the provider redirects the browser
  // back to /integrations, then strip the query params so refreshes are clean.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const oauthError = params.get('integration_error');
    if (!connected && !oauthError) return;

    if (connected) {
      const name = APP_NAME_BY_TYPE.get(connected.toUpperCase()) || connected;
      toast.success(`${name} connected`);
      refetch?.();
    } else if (oauthError) {
      toast.error('Connection failed', { description: oauthError });
    }
    window.history.replaceState({}, '', '/integrations');
  }, [refetch]);

  const connectedByType = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const i of integrations) map.set(i.type, i);
    return map;
  }, [integrations]);

  const handleConnect = async (app: AppDef) => {
    setBusy(app.type);
    try {
      const res = await initiateOAuth({ variables: { type: app.type } });
      const url = res.data?.initiateIntegrationOAuth?.url;
      if (url) {
        // Full-page redirect into the provider's consent screen. On return the
        // callback effect above reports the honest result.
        window.location.href = url;
      } else {
        setBusy(null);
      }
    } catch {
      // Error toast is raised by the hook; just clear the busy state.
      setBusy(null);
    }
  };

  const handleDisconnect = async (id: string, type: string) => {
    setBusy(type);
    try {
      await disconnectIntegration({ variables: { id } });
    } finally {
      setBusy(null);
    }
  };

  const handleSync = async (id: string, type: string) => {
    setBusy(type);
    try {
      await syncIntegration({ variables: { id } });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {APPS.map((app) => {
        const Icon = app.icon;
        const connected = connectedByType.get(app.type);
        const isBusy = busy === app.type;
        const isConnected = Boolean(connected?.isActive);
        const syncError: string | undefined = connected?.config?.syncError;
        const stats = connected?.config?.lastSyncStats;
        const isPmSync = PM_SYNC_TYPES.has(app.type);
        const isSlack = app.type === 'SLACK';
        const isOAuthOnly = OAUTH_ONLY_TYPES.has(app.type);
        const hasSettings = isPmSync || isSlack;
        const canSync = isPmSync || isSlack;
        const slackNeedsChannel = isSlack && isConnected && !connected?.config?.channelId;

        return (
          <Card key={app.type} className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-[10px] flex items-center justify-center text-white flex-none"
                  style={{ backgroundColor: app.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{app.name}</h3>
                    {isConnected && !syncError && (
                      <Badge variant="default" className="text-[10px] bg-green-600">
                        <Check className="h-2.5 w-2.5 mr-0.5" /> Connected
                      </Badge>
                    )}
                    {isConnected && syncError && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Sync error
                      </Badge>
                    )}
                    {isBusy && !isConnected && (
                      <Badge variant="secondary" className="text-[10px]">
                        Connecting…
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2">
                    {app.description}
                  </p>
                </div>
              </div>

              {syncError && (
                <p className="text-[11px] text-destructive mt-3 line-clamp-2">{syncError}</p>
              )}

              {isOAuthOnly && isConnected && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Connected for sign-in. Task/meeting import is coming soon.
                </p>
              )}

              {slackNeedsChannel && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3">
                  Choose a channel in settings to start receiving your daily digest.
                </p>
              )}

              {connected?.lastSyncedAt && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Last synced {format(new Date(connected.lastSyncedAt), 'MMM d, h:mm a')}
                  {isPmSync && stats && typeof stats.total === 'number' && (
                    <> · {stats.total} item{stats.total === 1 ? '' : 's'} tracked</>
                  )}
                </p>
              )}

              <div className="mt-auto pt-4 flex gap-2">
                {loading ? (
                  <Button variant="outline" size="sm" className="w-full h-8" disabled>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </Button>
                ) : isConnected ? (
                  <>
                    {canSync && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1"
                        disabled={isBusy || slackNeedsChannel}
                        title={slackNeedsChannel ? 'Choose a channel first' : undefined}
                        onClick={() => handleSync(connected.id, app.type)}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            {isSlack ? 'Send digest' : 'Sync'}
                          </>
                        )}
                      </Button>
                    )}
                    {hasSettings && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        disabled={isBusy}
                        aria-label={isSlack ? 'Slack settings' : 'Sync settings'}
                        onClick={() => setSettingsFor(connected)}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 text-destructive ${isOAuthOnly ? 'flex-1' : ''}`}
                      disabled={isBusy}
                      onClick={() => handleDisconnect(connected.id, app.type)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full h-8"
                    disabled={isBusy}
                    onClick={() => handleConnect(app)}
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Connect'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <IntegrationSettingsDialog
        integration={settingsFor}
        open={Boolean(settingsFor)}
        onOpenChange={(open) => {
          if (!open) setSettingsFor(null);
        }}
      />
    </div>
  );
}
