import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Debug mode in development
    debug: process.env.NODE_ENV === "development",
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Random network errors
      "Network request failed",
      "NetworkError",
      "Failed to fetch",
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === "development") {
        return null;
      }
      
      // Filter out specific URLs
      if (event.request?.url?.includes("/api/placeholder-thumbnail")) {
        return null;
      }
      
      return event;
    },
  });
}