'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
  useWebhookDeliveries,
  useRetryWebhookDelivery,
} from '@/hooks/use-graphql-extended';

const EVENTS = [
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_COMPLETED',
  'TASK_DELETED',
  'GOAL_CREATED',
  'GOAL_UPDATED',
  'GOAL_DELETED',
  'PLAN_GENERATED',
  'PLAN_ACCEPTED',
  'BOOKING_CREATED',
  'BOOKING_CANCELED',
];

function DeliveryLog({ webhookId }: { webhookId: string }) {
  const { deliveries, loading, refetch } = useWebhookDeliveries(webhookId);
  const { retryDelivery } = useRetryWebhookDelivery();

  if (loading) return <Skeleton className="h-16 w-full rounded-[10px]" />;

  if (deliveries.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground py-3">
        No deliveries yet. Deliveries appear here once events fire.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 pt-2">
      {deliveries.map((d: any) => (
        <div
          key={d.id}
          className="flex items-center gap-2 rounded-[8px] border border-border px-3 py-2 text-xs"
        >
          <Badge
            variant={
              d.status === 'SUCCESS'
                ? 'default'
                : d.status === 'FAILED'
                ? 'destructive'
                : 'secondary'
            }
            className="text-[10px]"
          >
            {d.status}
          </Badge>
          <span className="font-mono text-muted-foreground">{d.event}</span>
          {d.statusCode && <span className="text-muted-foreground">HTTP {d.statusCode}</span>}
          <span className="text-muted-foreground ml-auto">
            {d.lastAttemptAt || d.createdAt
              ? format(new Date(d.lastAttemptAt || d.createdAt), 'MMM d, h:mm a')
              : ''}
          </span>
          {d.status === 'FAILED' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={async () => {
                await retryDelivery({ variables: { deliveryId: d.id } });
                await refetch();
              }}
              title="Retry delivery"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export function WebhooksManager() {
  const { webhooks, loading } = useWebhooks();
  const { createWebhook, loading: creating } = useCreateWebhook();
  const { deleteWebhook } = useDeleteWebhook();
  const { toggleWebhook } = useToggleWebhook();

  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [events, setEvents] = React.useState<string[]>(['TASK_COMPLETED']);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const toggleEvent = (e: string) => {
    setEvents((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  };

  const handleCreate = async () => {
    if (!url.trim() || events.length === 0) return;
    try {
      await createWebhook({ variables: { input: { url: url.trim(), events } } });
      setUrl('');
      setEvents(['TASK_COMPLETED']);
      setOpen(false);
    } catch {
      /* toast in hook */
    }
  };

  const webhookToDelete = webhooks.find((w: any) => w.id === deleteId);

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <WebhookIcon className="h-4 w-4" /> Webhooks
            </CardTitle>
            <CardDescription className="text-[13px]">
              Send real-time event notifications to your own endpoints.
            </CardDescription>
          </div>
          <Button size="sm" className="h-9" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[10px]" />
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
            No webhooks yet. Add one to receive event callbacks.
          </div>
        ) : (
          <div className="space-y-2">
            {webhooks.map((wh: any) => (
              <div key={wh.id} className="rounded-[10px] border border-border">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium font-mono truncate">{wh.url}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(wh.events || []).slice(0, 4).map((e: string) => (
                        <Badge key={e} variant="secondary" className="text-[10px]">
                          {e.toLowerCase().replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {(wh.events || []).length > 4 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{wh.events.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={wh.isActive}
                    onCheckedChange={async () => {
                      await toggleWebhook({ variables: { id: wh.id } });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setExpanded(expanded === wh.id ? null : wh.id)}
                    title="Delivery log"
                  >
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', expanded === wh.id && 'rotate-180')}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeleteId(wh.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {expanded === wh.id && (
                  <div className="border-t border-border px-3 pb-3">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Delivery log
                      </span>
                      {wh.secret && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(wh.secret);
                            toast.success('Signing secret copied');
                          }}
                        >
                          <Copy className="mr-1.5 h-3 w-3" /> Copy secret
                        </Button>
                      )}
                    </div>
                    <DeliveryLog webhookId={wh.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>New webhook</DialogTitle>
            <DialogDescription>We&apos;ll POST event payloads to this URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wh-url">Endpoint URL</Label>
              <Input
                id="wh-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhooks/microplanner"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {EVENTS.map((e) => (
                  <label
                    key={e}
                    className="flex items-center gap-2 rounded-[8px] border border-border p-2 cursor-pointer hover:bg-accent/50"
                  >
                    <Checkbox checked={events.includes(e)} onCheckedChange={() => toggleEvent(e)} />
                    <span className="text-[13px]">{e.toLowerCase().replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!url.trim() || events.length === 0 || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        itemName={webhookToDelete?.url || 'this webhook'}
        itemType="webhook"
        onConfirm={async () => {
          if (deleteId) await deleteWebhook({ variables: { id: deleteId } });
          setDeleteId(null);
        }}
      />
    </Card>
  );
}
