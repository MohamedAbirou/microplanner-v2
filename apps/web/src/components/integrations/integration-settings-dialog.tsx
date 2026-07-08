'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIntegrationResources, useUpdateIntegration } from '@/hooks/use-graphql-extended';

interface ConnectedIntegration {
  id: string;
  type: string;
  config?: Record<string, any> | null;
}

interface Props {
  integration: ConnectedIntegration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Label the resource selector per provider so it reads naturally.
const RESOURCE_LABEL: Record<string, string> = {
  TODOIST: 'Project',
  LINEAR: 'Team',
  NOTION: 'Database',
  JIRA: 'Project',
  ASANA: 'Project',
  SLACK: 'Channel',
};

const NO_FILTER = '__all__';

export function IntegrationSettingsDialog({ integration, open, onOpenChange }: Props) {
  const { fetchResources, resources, loading: resourcesLoading } = useIntegrationResources();
  const { updateIntegration, loading: saving } = useUpdateIntegration();

  const [projectId, setProjectId] = React.useState<string>(NO_FILTER);
  const [direction, setDirection] = React.useState<string>('bidirectional');

  const isSlack = integration?.type === 'SLACK';
  const isNotion = integration?.type === 'NOTION';
  // Slack and Notion require a specific target (channel / database) — no "all".
  const requiresSelection = isSlack || isNotion;

  // Load current config + available resources whenever the dialog opens.
  React.useEffect(() => {
    if (!open || !integration) return;
    const cfg = integration.config || {};
    setProjectId(cfg.channelId || cfg.databaseId || cfg.projectId || NO_FILTER);
    setDirection(cfg.syncDirection || 'bidirectional');
    fetchResources({ variables: { id: integration.id } });
  }, [open, integration, fetchResources]);

  if (!integration) return null;

  const resourceLabel = RESOURCE_LABEL[integration.type] || 'Project';

  const handleSave = async () => {
    // Merge into existing config so sync stats / errors aren't wiped.
    const nextConfig: Record<string, any> = { ...(integration.config || {}) };
    const selected = projectId === NO_FILTER ? undefined : projectId;
    if (isSlack) {
      nextConfig.channelId = selected;
      nextConfig.channelName = resources.find((r) => r.id === selected)?.name;
    } else if (isNotion) {
      nextConfig.databaseId = selected;
      nextConfig.syncDirection = direction;
    } else {
      nextConfig.projectId = selected;
      nextConfig.syncDirection = direction;
    }
    await updateIntegration({ variables: { id: integration.id, input: { config: nextConfig } } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSlack ? 'Slack settings' : 'Sync settings'}</DialogTitle>
          <DialogDescription>
            {isSlack
              ? 'Choose the channel that receives your daily plan digest and the /microplanner today command.'
              : 'Choose what to import and whether completing a task here closes it in the source.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{resourceLabel}</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={resourcesLoading}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    resourcesLoading
                      ? 'Loading…'
                      : requiresSelection
                        ? `Select a ${resourceLabel.toLowerCase()}`
                        : `All ${resourceLabel.toLowerCase()}s`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!requiresSelection && (
                  <SelectItem value={NO_FILTER}>All {resourceLabel.toLowerCase()}s</SelectItem>
                )}
                {resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isNotion && (
              <p className="text-[11px] text-muted-foreground">
                Notion requires a specific database to sync from.
              </p>
            )}
            {isSlack && !resourcesLoading && resources.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No channels found. Invite the MicroPlanner bot to a channel, then reopen this dialog.
              </p>
            )}
          </div>

          {!isSlack && (
            <div className="space-y-1.5">
              <Label>Sync direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Import only</SelectItem>
                  <SelectItem value="bidirectional">Two-way (complete syncs back)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (requiresSelection && projectId === NO_FILTER)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
