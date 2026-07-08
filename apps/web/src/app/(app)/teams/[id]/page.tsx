'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, UserPlus, Loader2, Users, Trash2, Mail, BarChart3, Target } from 'lucide-react';
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
  useTeam,
  useTeamMembers,
  useInviteTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
  useTeamDashboard,
} from '@/hooks/use-graphql-extended';

const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'] as const;

function TeamDashboardCard({ teamId }: { teamId: string }) {
  const { dashboard, loading } = useTeamDashboard(teamId);

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px] flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Team dashboard
        </CardTitle>
        <CardDescription className="text-[13px]">
          This week&apos;s completion by member, plus goals shared with the team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !dashboard ? (
          <Skeleton className="h-32 w-full rounded-[10px]" />
        ) : !dashboard ? null : (
          <>
            <div className="flex items-center gap-4 rounded-[10px] border border-border bg-accent/40 p-3">
              <div>
                <div className="text-2xl font-semibold">{dashboard.completionRate}%</div>
                <div className="text-[12px] text-muted-foreground">Team completion (7d)</div>
              </div>
              <div className="text-[13px] text-muted-foreground">
                {dashboard.totalTasksCompleted} of {dashboard.totalTasks} tasks completed across{' '}
                {dashboard.memberCount} member{dashboard.memberCount === 1 ? '' : 's'}.
              </div>
            </div>

            <div className="space-y-2">
              {dashboard.members.map((m: any) => (
                <div key={m.userId} className="flex items-center gap-3">
                  <div className="w-40 min-w-0 truncate text-sm">{m.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${m.completionRate}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-[12px] text-muted-foreground">
                    {m.tasksCompleted}/{m.tasksTotal} · {m.completionRate}%
                  </div>
                </div>
              ))}
            </div>

            {dashboard.goals.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[13px] font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Shared goals
                </div>
                {dashboard.goals.map((g: any) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-2.5 text-[13px]"
                  >
                    <span className="truncate">
                      {g.emoji} {g.title}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(g.completionRate)}% · {g.ownerName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TeamDetailContent({ teamId }: { teamId: string }) {
  const { team, loading: teamLoading } = useTeam(teamId);
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

      <TeamDashboardCard teamId={teamId} />

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
