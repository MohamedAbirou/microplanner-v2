'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Key, Plus, Trash2, Copy, Loader2, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@/hooks/use-graphql-extended';

const SCOPES = [
  { value: 'READ_TASKS', label: 'Read tasks' },
  { value: 'WRITE_TASKS', label: 'Write tasks' },
  { value: 'READ_GOALS', label: 'Read goals' },
  { value: 'WRITE_GOALS', label: 'Write goals' },
  { value: 'READ_PLANS', label: 'Read plans' },
  { value: 'WRITE_PLANS', label: 'Write plans' },
  { value: 'READ_ANALYTICS', label: 'Read analytics' },
  { value: 'WEBHOOKS', label: 'Manage webhooks' },
];

export function ApiKeysManager() {
  const { apiKeys, loading } = useApiKeys();
  const { createApiKey, loading: creating } = useCreateApiKey();
  const { deleteApiKey } = useDeleteApiKey();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [scopes, setScopes] = React.useState<string[]>(['READ_TASKS']);
  const [createdSecret, setCreatedSecret] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || scopes.length === 0) return;
    try {
      const { data } = await createApiKey({
        variables: { input: { name: name.trim(), scopes } },
      });
      const secret = data?.createApiKey?.key;
      setCreatedSecret(secret || null);
      setName('');
      setScopes(['READ_TASKS']);
      setOpen(false);
    } catch {
      /* toast in hook */
    }
  };

  const copySecret = () => {
    if (!createdSecret) return;
    navigator.clipboard.writeText(createdSecret);
    setCopied(true);
    toast.success('API key copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const keyToDelete = apiKeys.find((k: any) => k.id === deleteId);

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Key className="h-4 w-4" /> API Keys
            </CardTitle>
            <CardDescription className="text-[13px]">
              Programmatic access to your MicroPlanner data. Keep keys secret.
            </CardDescription>
          </div>
          <Button size="sm" className="h-9" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Key
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
        ) : apiKeys.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
            No API keys yet. Create one to start using the API.
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key: any) => (
              <div
                key={key.id}
                className="flex items-center gap-3 rounded-[10px] border border-border p-3"
              >
                <Key className="h-4 w-4 text-muted-foreground flex-none" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{key.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {key.keyPrefix}••••••••
                  </div>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px] justify-end">
                  {(key.scopes || []).slice(0, 3).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s.toLowerCase().replace('_', ' ')}
                    </Badge>
                  ))}
                  {(key.scopes || []).length > 3 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{key.scopes.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground hidden md:block flex-none">
                  {key.lastUsedAt
                    ? `Used ${format(new Date(key.lastUsedAt), 'MMM d')}`
                    : 'Never used'}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-none"
                  onClick={() => setDeleteId(key.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Choose the scopes this key is allowed to use.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CI automation"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="grid grid-cols-2 gap-2">
                {SCOPES.map((s) => (
                  <label
                    key={s.value}
                    className="flex items-center gap-2 rounded-[8px] border border-border p-2 cursor-pointer hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={scopes.includes(s.value)}
                      onCheckedChange={() => toggleScope(s.value)}
                    />
                    <span className="text-[13px]">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || scopes.length === 0 || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret reveal (shown once) */}
      <Dialog open={!!createdSecret} onOpenChange={(o) => !o && setCreatedSecret(null)}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>Copy your API key</DialogTitle>
            <DialogDescription>
              This is the only time the full key is shown. Store it somewhere safe.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-[10px] border border-amber-300 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 flex-none" />
            <p className="text-[13px] text-amber-800 dark:text-amber-300">
              You won&apos;t be able to see this key again after closing this dialog.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-[8px] bg-muted px-3 py-2 text-xs font-mono break-all">
              {createdSecret}
            </code>
            <Button size="icon" variant="outline" className="h-9 w-9 flex-none" onClick={copySecret}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedSecret(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        itemName={keyToDelete?.name || 'this key'}
        itemType="API key"
        onConfirm={async () => {
          if (deleteId) await deleteApiKey({ variables: { id: deleteId } });
          setDeleteId(null);
        }}
      />
    </Card>
  );
}
