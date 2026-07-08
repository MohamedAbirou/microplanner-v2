'use client';

import * as React from 'react';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePmInboxTasks, useImportPmTasks } from '@/hooks/use-graphql-extended';

const SOURCE_LABEL: Record<string, string> = {
  todoist: 'Todoist',
  linear: 'Linear',
  notion: 'Notion',
  jira: 'Jira',
  asana: 'Asana',
};

/**
 * Plan-day ritual: pull open tasks from connected PM tools and import the ones
 * you want into today's plan. Renders nothing when no PM tools are connected or
 * there's nothing new to import.
 */
export function PmImportSection({ onImported }: { onImported?: () => void }) {
  const { inbox, loading, refetch } = usePmInboxTasks();
  const { importPmTasks, loading: importing } = useImportPmTasks();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const importable = React.useMemo(
    () => (inbox || []).filter((t: any) => !t.alreadyImported),
    [inbox],
  );

  if (loading && (!inbox || inbox.length === 0)) return null;
  if (!loading && importable.length === 0) return null;

  const key = (t: any) => `${t.source}:${t.externalId}`;
  const toggle = (t: any) => setSelected((p) => ({ ...p, [key(t)]: !p[key(t)] }));

  const handleImport = async () => {
    const items = importable
      .filter((t: any) => selected[key(t)])
      .map((t: any) => ({
        integrationId: t.integrationId,
        source: t.source,
        externalId: t.externalId,
        title: t.title,
        dueDate: t.dueDate,
        url: t.url,
      }));
    if (items.length === 0) return;
    const { data } = await importPmTasks({ variables: { items } });
    const n = data?.importPmTasks?.imported ?? 0;
    toast.success(`Imported ${n} task${n === 1 ? '' : 's'}`);
    setSelected({});
    await refetch();
    onImported?.();
  };

  const selectedCount = importable.filter((t: any) => selected[key(t)]).length;

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px]">Import from your tools</CardTitle>
        <CardDescription className="text-[13px]">
          Open tasks from your connected apps. Select the ones to work on today.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {importable.map((t: any) => (
            <label
              key={key(t)}
              className="flex items-center gap-3 rounded-[10px] border border-border p-3 cursor-pointer hover:bg-accent/50"
            >
              <Checkbox checked={!!selected[key(t)]} onCheckedChange={() => toggle(t)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {SOURCE_LABEL[t.source] || t.source}
                  </Badge>
                  {t.dueDate && <span>due {new Date(t.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
              {t.url && (
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </label>
          ))}
        </div>
        <Button onClick={handleImport} disabled={importing || selectedCount === 0} className="w-full">
          {importing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Import {selectedCount > 0 ? `${selectedCount} ` : ''}selected
        </Button>
      </CardContent>
    </Card>
  );
}
