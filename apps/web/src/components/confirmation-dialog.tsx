'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  icon,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easier use
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>>({
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const confirm = React.useCallback(
    (props: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>) => {
      return new Promise<boolean>((resolve) => {
        setConfig({
          ...props,
          onConfirm: async () => {
            await props.onConfirm();
            resolve(true);
          },
        });
        setIsOpen(true);
      });
    },
    []
  );

  const dialog = (
    <ConfirmationDialog
      {...config}
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // User cancelled
        }
      }}
    />
  );

  return { confirm, dialog, isOpen, setIsOpen };
}

// Pre-configured deletion dialog
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType = 'item',
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType}?`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
    />
  );
}
