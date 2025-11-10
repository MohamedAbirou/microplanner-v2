import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-brand text-white shadow-glow-brand hover:shadow-glow-blue active:scale-95',
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-glow-blue',
        accent:
          'bg-accent-600 text-white hover:bg-accent-700 shadow-sm hover:shadow-glow-purple',
        success:
          'bg-success text-white hover:bg-success-dark shadow-sm',
        warning:
          'bg-warning text-white hover:bg-warning-dark shadow-sm',
        error:
          'bg-error text-white hover:bg-error-dark shadow-sm',
        outline:
          'border-2 border-dark-border-primary bg-transparent text-dark-text-primary hover:bg-dark-bg-hover hover:border-dark-border-secondary',
        secondary:
          'bg-dark-bg-secondary text-dark-text-primary hover:bg-dark-bg-hover border border-dark-border-primary',
        ghost:
          'text-dark-text-secondary hover:bg-dark-bg-hover hover:text-dark-text-primary',
        link:
          'text-primary-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base',
        xl: 'h-14 rounded-xl px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
