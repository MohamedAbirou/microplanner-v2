'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Bell, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  REGISTER_PUSH_TOKEN,
  UNREGISTER_PUSH_TOKEN,
} from '@/graphql/operations-extended';
import {
  isPushSupported,
  isPushConfigured,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
} from '@/lib/push';

export function PushNotificationsToggle() {
  const [enabled, setEnabled] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [registerPushToken] = useMutation(REGISTER_PUSH_TOKEN);
  const [unregisterPushToken] = useMutation(UNREGISTER_PUSH_TOKEN);

  const supported = isPushSupported();
  const configured = isPushConfigured();

  React.useEffect(() => {
    let active = true;
    getExistingSubscription().then((sub) => {
      if (active) {
        setEnabled(!!sub);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleToggle = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) {
        const sub = await subscribeToPush();
        if (!sub) {
          toast.error('Push permission was not granted');
          return;
        }
        await registerPushToken({ variables: { subscription: sub } });
        setEnabled(true);
        toast.success('Push notifications enabled');
      } else {
        const endpoint = await unsubscribeFromPush();
        if (endpoint) {
          await unregisterPushToken({ variables: { endpoint } });
        }
        setEnabled(false);
        toast.success('Push notifications disabled');
      }
    } catch (err: any) {
      toast.error('Failed to update push notifications', { description: err?.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-[10px] border border-border p-4">
      <div className="flex items-start gap-3">
        <Bell className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">Push notifications</div>
          <p className="text-[13px] text-muted-foreground">
            {!supported
              ? 'Your browser does not support push notifications.'
              : !configured
              ? 'Push notifications are not configured on this deployment.'
              : 'Get reminders and nudges even when MicroPlanner is closed.'}
          </p>
        </div>
      </div>
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={enabled}
          disabled={!configured || !ready}
          onCheckedChange={handleToggle}
        />
      )}
    </div>
  );
}
