'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type PageLoaderPreset =
  | 'default'
  | 'dashboard'
  | 'tasks'
  | 'goals'
  | 'plans'
  | 'analytics'
  | 'calendar'
  | 'settings'
  | 'search'
  | 'review';

const PRESET_MESSAGES: Record<PageLoaderPreset, string[]> = {
  default: ['Getting things ready', 'Almost there'],
  dashboard: ['Loading your day', 'Preparing your agenda'],
  tasks: ['Loading tasks', 'Organizing your schedule'],
  goals: ['Loading goals', 'Tracking your progress'],
  plans: ['Loading plans', 'Preparing your week'],
  analytics: ['Crunching the numbers', 'Building your insights'],
  calendar: ['Loading calendar', 'Syncing your schedule'],
  settings: ['Loading settings', 'Fetching preferences'],
  search: ['Searching', 'Finding matches'],
  review: ['Loading plan review', 'Reviewing your week'],
};

type PageLoaderVariant = 'page' | 'section' | 'shell' | 'inline';

export interface PageLoaderProps {
  /** Preset key or custom status line */
  label?: PageLoaderPreset | string;
  variant?: PageLoaderVariant;
  showSkeleton?: boolean;
  skeletonRows?: number;
  className?: string;
}

function resolveMessages(label: PageLoaderPreset | string): string[] {
  if (label in PRESET_MESSAGES) {
    return PRESET_MESSAGES[label as PageLoaderPreset];
  }
  return [label];
}

function LoaderOrb({ reducedMotion }: { reducedMotion: boolean }) {
  const dots = [
    { x: 0, y: -14 },
    { x: 12, y: 7 },
    { x: -12, y: 7 },
  ];

  return (
    <div className="relative flex h-[72px] w-[72px] items-center justify-center">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-primary/15 blur-2xl"
        animate={
          reducedMotion
            ? { opacity: 0.5 }
            : { scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.65, 0.35] }
        }
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute h-11 w-11 rounded-full border border-primary/20"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative h-8 w-8">
        {dots.map((dot, index) => (
          <motion.span
            key={index}
            aria-hidden
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
            style={{ x: dot.x, y: dot.y }}
            animate={
              reducedMotion
                ? { opacity: 0.8 }
                : { scale: [1, 1.45, 1], opacity: [0.45, 1, 0.45] }
            }
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.18,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LoaderSkeleton({
  rows,
  reducedMotion,
}: {
  rows: number;
  reducedMotion: boolean;
}) {
  return (
    <div className="mt-10 w-full max-w-lg space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.25 }}
          className={cn(
            'h-[52px] rounded-[14px] border border-border/60 bg-muted/40',
            !reducedMotion && 'mp-loader-shimmer'
          )}
          style={{ width: `${100 - (index % 3) * 8}%` }}
        />
      ))}
    </div>
  );
}

export function PageLoader({
  label = 'default',
  variant = 'page',
  showSkeleton = true,
  skeletonRows = 4,
  className,
}: PageLoaderProps) {
  const reducedMotion = useReducedMotion();
  const messages = resolveMessages(label);
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (messages.length <= 1) return;
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  const statusText = messages[messageIndex] ?? messages[0];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'mp-page-loader',
        variant === 'page' &&
          'flex min-h-[52vh] w-full flex-col items-center justify-center px-6 py-14',
        variant === 'section' &&
          'flex w-full flex-col items-center justify-center px-4 py-14',
        variant === 'shell' &&
          'flex min-h-screen w-full flex-col items-center justify-center bg-background',
        variant === 'inline' && 'inline-flex items-center gap-3 py-2',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        {variant !== 'inline' && <LoaderOrb reducedMotion={!!reducedMotion} />}

        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            className={cn(
              'text-[13px] font-medium tracking-tight text-muted-foreground',
              variant !== 'inline' && 'mt-5'
            )}
          >
            {statusText}
            <motion.span
              aria-hidden
              className="inline-flex w-[18px] justify-start"
              animate={reducedMotion ? undefined : { opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              …
            </motion.span>
          </motion.p>
        </AnimatePresence>

        {showSkeleton && (variant === 'page' || variant === 'section') && (
          <LoaderSkeleton rows={skeletonRows} reducedMotion={!!reducedMotion} />
        )}
      </motion.div>
    </div>
  );
}

export interface PageLoadingStateProps extends PageLoaderProps {
  loading: boolean;
  children: React.ReactNode;
}

/** Drop-in early return: show loader while `loading`, otherwise render children. */
export function PageLoadingState({
  loading,
  children,
  ...loaderProps
}: PageLoadingStateProps) {
  if (loading) {
    return <PageLoader {...loaderProps} />;
  }
  return <>{children}</>;
}
