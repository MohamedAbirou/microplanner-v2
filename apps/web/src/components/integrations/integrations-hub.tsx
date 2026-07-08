'use client';

import * as React from 'react';
import { MessageSquare, Video, FileText, Layers, Github, Zap, Check, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  useIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
  useSyncIntegration,
} from '@/hooks/use-graphql-extended';

interface AppDef {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const APPS: AppDef[] = [
  { type: 'SLACK', name: 'Slack', description: 'Get plan reminders and task nudges in Slack', icon: MessageSquare, color: '#611f69' },
  { type: 'ZOOM', name: 'Zoom', description: 'Auto-create Zoom links for scheduled meetings', icon: Video, color: '#2D8CFF' },
  { type: 'NOTION', name: 'Notion', description: 'Sync goals and tasks with a Notion database', icon: FileText, color: '#000000' },
  { type: 'LINEAR', name: 'Linear', description: 'Turn Linear issues into scheduled tasks', icon: Layers, color: '#5E6AD2' },
  { type: 'GITHUB', name: 'GitHub', description: 'Track PRs and issues alongside your plan', icon: Github, color: '#24292e' },
  { type: 'ZAPIER', name: 'Zapier', description: 'Connect MicroPlanner to 6,000+ apps', icon: Zap, color: '#FF4A00' },
];

export function IntegrationsHub() {
  const { integrations, loading } = useIntegrations();
  const { connectIntegration } = useConnectIntegration();
  const { disconnectIntegration } = useDisconnectIntegration();
  const { syncIntegration } = useSyncIntegration();
  const [busy, setBusy] = React.useState<string | null>(null);

  const connectedByType = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const i of integrations) map.set(i.type, i);
    return map;
  }, [integrations]);

  const handleConnect = async (app: AppDef) => {
    setBusy(app.type);
    try {
      // Registers the integration; a full OAuth handshake would pass authCode here.
      await connectIntegration({ variables: { input: { type: app.type, name: app.name } } });
    } finally {
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
                    {connected?.isActive && (
                      <Badge variant="default" className="text-[10px] bg-green-600">
                        <Check className="h-2.5 w-2.5 mr-0.5" /> Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2">
                    {app.description}
                  </p>
                </div>
              </div>

              {connected?.lastSyncedAt && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Last synced {format(new Date(connected.lastSyncedAt), 'MMM d, h:mm a')}
                </p>
              )}

              <div className="mt-auto pt-4 flex gap-2">
                {loading ? (
                  <Button variant="outline" size="sm" className="w-full h-8" disabled>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </Button>
                ) : connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1"
                      disabled={isBusy}
                      onClick={() => handleSync(connected.id, app.type)}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive"
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
    </div>
  );
}
