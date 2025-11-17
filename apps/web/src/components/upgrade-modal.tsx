'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  feature?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = 'Upgrade Required',
  description,
  feature = 'this feature',
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description || `You've reached the limit for ${feature} on the FREE plan.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-semibold text-sm">Upgrade to unlock:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Unlimited goals
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Unlimited tasks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Priority support
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={() => {
            window.location.href = '/pricing';
          }}>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
