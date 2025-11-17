import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  enabled: process.env.NODE_ENV === 'production',

  // Filter out some common errors that we don't want to track
  ignoreErrors: [
    // Network errors
    'NetworkError',
    'ChunkLoadError',
    // Aborted
    'AbortError',
  ],

  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
