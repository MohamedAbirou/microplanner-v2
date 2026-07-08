'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReferralStats } from '@/hooks/use-graphql-extended';

export function ReferralPanel() {
  const { stats, loading } = useReferralStats();
  const [copied, setCopied] = React.useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = stats?.code ? `${origin}/sign-up?ref=${stats.code}` : '';

  const copy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on MicroPlanner',
          text: 'Plan your week with AI. Join me on MicroPlanner:',
          url: inviteLink,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px] flex items-center gap-2">
          <Gift className="h-4 w-4" /> Invite friends
        </CardTitle>
        <CardDescription className="text-[13px]">
          Share your link. When friends subscribe, you both get rewarded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <Skeleton className="h-10 w-full rounded-[10px]" />
        ) : (
          <>
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="font-mono text-xs" />
              <Button variant="outline" size="icon" className="h-9 w-9 flex-none" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button className="h-9 flex-none" onClick={share}>
                Share
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[10px] border border-border p-3 text-center">
                <div className="text-xl font-bold">{stats?.totalReferrals ?? 0}</div>
                <div className="text-xs text-muted-foreground">invited</div>
              </div>
              <div className="rounded-[10px] border border-border p-3 text-center">
                <div className="text-xl font-bold">{stats?.pendingReferrals ?? 0}</div>
                <div className="text-xs text-muted-foreground">pending</div>
              </div>
              <div className="rounded-[10px] border border-border p-3 text-center">
                <div className="text-xl font-bold text-green-600">{stats?.activeReferrals ?? 0}</div>
                <div className="text-xs text-muted-foreground">subscribed</div>
              </div>
            </div>

            {stats?.referrals && stats.referrals.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Your referrals
                </div>
                <div className="space-y-1.5">
                  {stats.referrals.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-[8px] bg-muted/50 px-3 py-2"
                    >
                      <span className="text-sm truncate">{r.referredName}</span>
                      <Badge
                        variant={r.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {r.status === 'ACTIVE'
                          ? 'Subscribed'
                          : r.status === 'PENDING'
                          ? 'Signed up'
                          : r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
