/**
 * Toast Hook
 * Custom hook for showing toast notifications
 */

import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const message = description ? `${title}\n${description}` : title;

    switch (variant) {
      case 'success':
        sonnerToast.success(title, {
          description,
          duration,
        });
        break;
      case 'error':
        sonnerToast.error(title, {
          description,
          duration,
        });
        break;
      case 'warning':
        sonnerToast.warning(title, {
          description,
          duration,
        });
        break;
      default:
        sonnerToast(title, {
          description,
          duration,
        });
    }
  }, []);

  return { toast };
}
