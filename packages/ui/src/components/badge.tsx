import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600/20 text-primary-400 border border-primary-600/30',
        primary:
          'bg-primary-600/20 text-primary-400 border border-primary-600/30',
        accent:
          'bg-accent-600/20 text-accent-400 border border-accent-600/30',
        success:
          'bg-success/20 text-success-light border border-success/30',
        warning:
          'bg-warning/20 text-warning-light border border-warning/30',
        error:
          'bg-error/20 text-error-light border border-error/30',
        secondary:
          'bg-dark-bg-tertiary text-dark-text-secondary border border-dark-border-primary',
        outline:
          'text-dark-text-primary border border-dark-border-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
