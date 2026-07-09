'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  CalendarClock,
  Plus,
  Loader2,
  Trash2,
  Copy,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { TierGate } from '@/components/tier-gate';
import {
  useSchedulingLinks,
  useCreateSchedulingLink,
  useDeleteSchedulingLink,
  useToggleSchedulingLink,
} from '@/hooks/use-graphql-extended';

const DURATIONS = [15, 30, 45, 60, 90];

// Sensible default availability (Mon–Fri, 9–5) required by the create input.
function defaultAvailability() {
  const weekday = [{ start: '09:00', end: '17:00' }];
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    schedule: {
      monday: weekday,
      tuesday: weekday,
      wednesday: weekday,
      thursday: weekday,
      friday: weekday,
      saturday: [],
      sunday: [],
    },
  };
}

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function SchedulingContent() {
  const { links, loading } = useSchedulingLinks();
  const { createLink, loading: creating } = useCreateSchedulingLink();
  const { deleteLink } = useDeleteSchedulingLink();
  const { toggleLink } = useToggleSchedulingLink();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugEdited, setSlugEdited] = React.useState(false);
  const [duration, setDuration] = React.useState(30);
  const [description, setDescription] = React.useState('');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCreate = async () => {
    const finalSlug = slug || slugify(name);
    if (!name.trim() || !finalSlug) return;
    try {
      await createLink({
        variables: {
          input: {
            name: name.trim(),
            slug: finalSlug,
            description: description.trim() || null,
            duration,
            availability: defaultAvailability(),
          },
        },
      });
      setName('');
      setSlug('');
      setSlugEdited(false);
      setDescription('');
      setDuration(30);
      setOpen(false);
    } catch {
      /* toast in hook */
    }
  };

  const copyUrl = (linkSlug: string) => {
    navigator.clipboard.writeText(`${origin}/book/${linkSlug}`);
    toast.success('Booking link copied to clipboard');
  };

  const linkToDelete = links.find((l: any) => l.id === deleteId);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto mp-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-6 w-6" /> Scheduling Links
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Share a link and let people book time on your calendar.
          </p>
        </div>
        <Button className="h-9" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Link
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[14px]" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="py-12 text-center">
            <Link2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No scheduling links yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 mb-4">
              Create a link to start accepting bookings.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create a link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link: any) => (
            <Card key={link.id} className="rounded-[14px] shadow-[var(--sh-sm)]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-[15px] truncate">{link.title}</CardTitle>
                    <CardDescription className="text-[13px] truncate">
                      /book/{link.slug} · {link.duration} min
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.isActive}
                      onCheckedChange={async () => {
                        await toggleLink({ variables: { id: link.id } });
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={link.isActive ? 'default' : 'secondary'} className="text-xs">
                    {link.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {link.bookingsCount ?? 0} bookings
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => copyUrl(link.slug)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy link
                  </Button>
                  <a href={`/book/${link.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="h-8">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Preview
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-auto"
                    onClick={() => setDeleteId(link.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>New scheduling link</DialogTitle>
            <DialogDescription>Defaults to weekdays 9am–5pm; you can refine later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="link-name">Name</Label>
              <Input
                id="link-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugEdited) setSlug(slugify(e.target.value));
                }}
                placeholder="30 minute meeting"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-slug">URL slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">/book/</span>
                <Input
                  id="link-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="30-min"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-desc">Description (optional)</Label>
              <Textarea
                id="link-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What is this meeting about?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        itemName={linkToDelete?.title || 'this link'}
        itemType="scheduling link"
        onConfirm={async () => {
          if (deleteId) await deleteLink({ variables: { id: deleteId } });
          setDeleteId(null);
        }}
      />
    </div>
  );
}

export default function SchedulingPage() {
  return (
    <TierGate requiredTier="PRO" feature="Scheduling links">
      <SchedulingContent />
    </TierGate>
  );
}
