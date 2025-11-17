'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  global?: boolean; // Works even when typing in input fields
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (unless shortcut is marked global)
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (isInput && !shortcut.global) continue;

        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const matchesMeta = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function useGlobalKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = React.useMemo(
    () => [
      // Navigation - G then X pattern (like Gmail)
      {
        key: 't',
        description: 'Go to Today',
        action: () => router.push('/today'),
      },
      {
        key: 'd',
        description: 'Go to Dashboard',
        action: () => router.push('/dashboard'),
      },
      {
        key: 'w',
        description: 'Go to Week',
        action: () => router.push('/week'),
      },
      {
        key: 'm',
        description: 'Go to Month',
        action: () => router.push('/month'),
      },
      {
        key: 'g',
        description: 'Go to Goals',
        action: () => router.push('/goals'),
      },
      {
        key: 'p',
        description: 'Go to Plans',
        action: () => router.push('/plans'),
      },
      {
        key: 'a',
        description: 'Go to Analytics',
        action: () => router.push('/analytics'),
      },
      {
        key: 's',
        description: 'Go to Settings',
        action: () => router.push('/settings'),
      },
      // Quick Actions
      {
        key: 'n',
        description: 'New Task',
        action: () => {
          // Trigger quick add task modal
          window.dispatchEvent(new CustomEvent('open-quick-add-task'));
        },
      },
      {
        key: 'c',
        metaKey: true,
        description: 'Copy',
        action: () => {
          // Default browser copy
        },
        global: false,
      },
      // Help
      {
        key: '?',
        shiftKey: true,
        description: 'Show keyboard shortcuts',
        action: () => {
          window.dispatchEvent(new CustomEvent('show-keyboard-shortcuts'));
        },
        global: true,
      },
    ],
    [router]
  );

  return shortcuts;
}
