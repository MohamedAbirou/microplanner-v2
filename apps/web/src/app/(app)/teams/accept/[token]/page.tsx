'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Check, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAcceptTeamInvitation } from '@/hooks/use-graphql-extended';

/**
 * Team invitation accept page. Reads the token from the URL, accepts the
 * invitation for the signed-in user, then redirects to the team dashboard.
 */
export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = Array.isArray(params?.token) ? params.token[0] : (params?.token as string);
  const { acceptInvitation } = useAcceptTeamInvitation();

  const [state, setState] = React.useState<'accepting' | 'success' | 'error'>('accepting');
  const [message, setMessage] = React.useState('');
  const ranRef = React.useRef(false);

  React.useEffect(() => {
    if (ranRef.current || !token) return;
    ranRef.current = true;
    (async () => {
      try {
        const { data } = await acceptInvitation({ variables: { token } });
        const teamId = data?.acceptTeamInvitation?.teamId;
        setState('success');
        setTimeout(() => router.replace(teamId ? `/teams/${teamId}` : '/teams'), 1200);
      } catch (err: any) {
        setState('error');
        setMessage(err?.message || 'This invitation could not be accepted.');
      }
    })();
  }, [token, acceptInvitation, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
      <Card className="w-full rounded-[14px] shadow-[var(--sh-sm)]">
        <CardHeader className="text-center">
          <CardTitle className="text-[17px]">
            {state === 'accepting' && 'Joining team…'}
            {state === 'success' && 'You’re in!'}
            {state === 'error' && 'Invitation problem'}
          </CardTitle>
          <CardDescription className="text-[13px]">
            {state === 'accepting' && 'Accepting your invitation.'}
            {state === 'success' && 'Redirecting you to the team…'}
            {state === 'error' && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {state === 'accepting' && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {state === 'success' && <Check className="h-8 w-8 text-green-600" />}
          {state === 'error' && (
            <>
              <XCircle className="h-8 w-8 text-destructive" />
              <Button variant="outline" onClick={() => router.replace('/teams')}>
                Go to Teams
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
