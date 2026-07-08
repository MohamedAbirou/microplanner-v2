'use client';

import * as React from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'mp:pwa-install-dismissed';
// Re-offer after a while rather than nagging every visit.
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

function recentlyDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const ts = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    return ts > 0 && Date.now() - ts < SNOOZE_MS;
  } catch {
    return false;
  }
}

/**
 * Native install banner. Captures `beforeinstallprompt`, then surfaces a
 * dismissible prompt that triggers the browser's real install flow. Hidden when
 * the app is already installed (standalone) or recently dismissed.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we present our own
      if (recentlyDismissed()) return;
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setVisible(false);
      setDeferred(null);
    }
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md sm:inset-x-auto sm:right-4">
      <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-3 shadow-[var(--sh-md)]">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Install MicroPlanner</div>
          <div className="text-[12px] text-muted-foreground">
            Add it to your home screen for faster access and offline planning.
          </div>
        </div>
        <div className="flex flex-none items-center gap-1.5">
          <Button size="sm" className="h-8" onClick={install}>
            Install
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
