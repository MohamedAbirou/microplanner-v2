'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, UserPlus, Loader2, Users, Trash2, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { TierGate } from '@/components/tier-gate';
import {
  useTeams,
  useTeamMembers,
  useInviteTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
} from '@/hooks/use-graphql-extended';

const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'] as const;

function TeamDetailContent({ teamId }: { teamId: string }) {
  const { teams } = useTeams();
  const team = teams.find((t: any) => t.id === teamId);
  const { members, loading, refetch } = useTeamMembers(teamId);
  const { inviteMember, loading: inviting } = useInviteTeamMember();
  const { removeTeamMember } = useRemoveTeamMember();
  const { updateTeamMemberRole } = useUpdateTeamMemberRole();

  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<(typeof ROLES)[number]>('MEMBER');

  const handleInvite = async () => {
    if (!email.trim()) return;
    try {
      await inviteMember({ variables: { input: { teamId, email: email.trim(), role } } });
      setEmail('');
      setRole('MEMBER');
      setOpen(false);
    } catch {
      /* toast in hook */
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateTeamMemberRole({ variables: { teamId, userId, role: newRole } });
    await refetch();
  };

  const handleRemove = async (userId: string) => {
    await removeTeamMember({ variables: { teamId, userId } });
    await refetch();
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto mp-fade-in">
      <div className="flex items-center gap-2">
        <Link href="/teams">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{team?.name || 'Team'}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {team?.description || 'Manage members and roles'}
          </p>
        </div>
        <Button className="h-9" onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Invite
        </Button>
      </div>

      <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
        <CardHeader>
          <CardTitle className="text-[15px] flex items-center gap-2">
            <Users className="h-4 w-4" /> Members
          </CardTitle>
          <CardDescription className="text-[13px]">
            People with access to this team&apos;s shared plans and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-[10px]" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
              No members yet. Invite someone to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m: any) => {
                const isOwner = m.role === 'OWNER';
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-[10px] border border-border p-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={m.user?.avatar} />
                      <AvatarFallback>
                        {(m.user?.name || m.user?.email || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {m.user?.name || m.user?.email}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{m.user?.email}</div>
                    </div>
                    {isOwner ? (
                      <Badge variant="secondary">Owner</Badge>
                    ) : (
                      <>
                        <Select
                          value={m.role}
                          onValueChange={(v) => handleRoleChange(m.userId, v)}
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemove(m.userId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
            <DialogDescription>
              They&apos;ll get an email invitation to join this team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!email.trim() || inviting}>
              {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = String(params.id);

  return (
    <TierGate requiredTier="PREMIUM" feature="Team workspaces">
      <TeamDetailContent teamId={teamId} />
    </TierGate>
  );
}
