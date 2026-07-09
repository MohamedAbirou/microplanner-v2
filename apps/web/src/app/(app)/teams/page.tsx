'use client';

import * as React from 'react';
import Link from 'next/link';
import { Users, Plus, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { TierGate } from '@/components/tier-gate';
import { format } from 'date-fns';
import { useTeams, useCreateTeam, useDeleteTeam } from '@/hooks/use-graphql-extended';

function TeamsContent() {
  const { teams, loading } = useTeams();
  const { createTeam, loading: creating } = useCreateTeam();
  const { deleteTeam } = useDeleteTeam();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createTeam({ variables: { input: { name: name.trim(), description: description.trim() || null } } });
      setName('');
      setDescription('');
      setOpen(false);
    } catch {
      /* toast in hook */
    }
  };

  const teamToDelete = teams.find((t: any) => t.id === deleteId);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto mp-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" /> Teams
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Create shared workspaces to plan and track work together.
          </p>
        </div>
        <Button className="h-9" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Team
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[14px]" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No teams yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 mb-4">
              Create your first team to invite members and share plans.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create a team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team: any) => (
            <Card key={team.id} className="rounded-[14px] shadow-[var(--sh-sm)] group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-[15px] truncate">{team.name}</CardTitle>
                    <CardDescription className="text-[13px] line-clamp-2">
                      {team.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => setDeleteId(team.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {team.createdAt ? `Created ${format(new Date(team.createdAt), 'MMM d, yyyy')}` : 'Team'}
                </Badge>
                <Link href={`/teams/${team.id}`}>
                  <Button variant="outline" size="sm" className="h-8">
                    Manage <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>Create a team</DialogTitle>
            <DialogDescription>Teams let you share plans and analytics with members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Product Team"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-desc">Description (optional)</Label>
              <Textarea
                id="team-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this team work on?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        itemName={teamToDelete?.name || 'this team'}
        itemType="team"
        onConfirm={async () => {
          if (deleteId) await deleteTeam({ variables: { id: deleteId } });
          setDeleteId(null);
        }}
      />
    </div>
  );
}

export default function TeamsPage() {
  return (
    <TierGate requiredTier="PREMIUM" feature="Team workspaces">
      <TeamsContent />
    </TierGate>
  );
}
