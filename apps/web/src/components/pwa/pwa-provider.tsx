'use client';

import * as React from 'react';
import { useAuth } from '@clerk/nextjs';
import { WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  countQueuedMutations,
  flushOfflineQueue,
  onQueueChange,
} from '@/lib/offline-queue';

/**
 * Registers the service worker, shows an offline indicator, and replays any
 * queued offline mutations when connectivity returns.
 */
export function PWAProvider() {
  const { getToken } = useAuth();
  const [offline, setOffline] = React.useState(false);
  const [pending, setPending] = React.useState(0);

  // Register the service worker once.
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return; // avoid dev caching headaches
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service worker registration failed', err);
    });
  }, []);

  // Track connectivity + queued count.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    setOffline(!navigator.onLine);
    const refreshCount = () => countQueuedMutations().then(setPending);
    refreshCount();

    const flush = async () => {
      const n = await flushOfflineQueue(() => getToken());
      await refreshCount();
      if (n > 0) {
        toast.success(`Synced ${n} offline change${n === 1 ? '' : 's'}`);
      }
    };

    const handleOnline = () => {
      setOffline(false);
      void flush();
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const unsub = onQueueChange(refreshCount);

    // Attempt a flush on mount in case we reloaded after reconnecting.
    if (navigator.onLine) void flush();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, [getToken]);

  if (!offline && pending === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] shadow-lg ${
          offline
            ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-200'
            : 'border-border bg-card text-foreground'
        }`}
      >
        {offline ? (
          <>
            <WifiOff className="h-4 w-4" />
            Offline
            {pending > 0 && <span>· {pending} change{pending === 1 ? '' : 's'} queued</span>}
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Syncing {pending} change{pending === 1 ? '' : 's'}…
          </>
        )}
      </div>
    </div>
  );
}
