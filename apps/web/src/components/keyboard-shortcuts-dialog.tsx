'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Command, Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  // Global
  {
    keys: ['⌘/Ctrl', 'K'],
    description: 'Open command palette',
    category: 'Global',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    category: 'Global',
  },
  {
    keys: ['Esc'],
    description: 'Close dialog / Cancel',
    category: 'Global',
  },

  // Navigation
  {
    keys: ['T'],
    description: 'Go to Today',
    category: 'Navigation',
  },
  {
    keys: ['D'],
    description: 'Go to Dashboard',
    category: 'Navigation',
  },
  {
    keys: ['W'],
    description: 'Go to Week',
    category: 'Navigation',
  },
  {
    keys: ['M'],
    description: 'Go to Month',
    category: 'Navigation',
  },
  {
    keys: ['G'],
    description: 'Go to Goals',
    category: 'Navigation',
  },
  {
    keys: ['P'],
    description: 'Go to Plans',
    category: 'Navigation',
  },
  {
    keys: ['A'],
    description: 'Go to Analytics',
    category: 'Navigation',
  },
  {
    keys: ['S'],
    description: 'Go to Settings',
    category: 'Navigation',
  },

  // Actions
  {
    keys: ['N'],
    description: 'Create new task',
    category: 'Actions',
  },
  {
    keys: ['⌘/Ctrl', 'Enter'],
    description: 'Submit form / Save',
    category: 'Actions',
  },
  {
    keys: ['⌘/Ctrl', 'S'],
    description: 'Save changes',
    category: 'Actions',
  },

  // Task Management
  {
    keys: ['E'],
    description: 'Edit task',
    category: 'Tasks',
  },
  {
    keys: ['C'],
    description: 'Complete task',
    category: 'Tasks',
  },
  {
    keys: ['Del'],
    description: 'Delete task',
    category: 'Tasks',
  },

  // Calendar
  {
    keys: ['←', '→'],
    description: 'Navigate days/weeks',
    category: 'Calendar',
  },
  {
    keys: ['Today'],
    description: 'Jump to today',
    category: 'Calendar',
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleShow = () => setOpen(true);
    window.addEventListener('show-keyboard-shortcuts', handleShow);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('show-keyboard-shortcuts', handleShow);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-muted-foreground">+</span>}
                            <Badge
                              variant="outline"
                              className="font-mono text-xs px-2 py-0.5"
                            >
                              {key}
                            </Badge>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              {category !== categories[categories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
          <Command className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Press <Badge variant="outline" className="mx-1 font-mono text-xs">⌘</Badge> or
            <Badge variant="outline" className="mx-1 font-mono text-xs">Ctrl</Badge> +
            <Badge variant="outline" className="mx-1 font-mono text-xs">K</Badge> to open
            the command palette
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
