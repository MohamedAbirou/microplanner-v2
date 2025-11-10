import { cn } from '../lib/utils';

/**
 * Skeleton component for loading states
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-dark-bg-tertiary',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
