import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Debug mode in development
    debug: process.env.NODE_ENV === "development",
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Ignore specific errors
    ignoreErrors: [
      // Supabase auth errors that are expected
      "AuthApiError",
      "Invalid claim",
      // Expected 404s
      "PGRST116",
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === "development") {
        return null;
      }
      
      // Filter out specific transaction names
      if (event.transaction === "GET /api/placeholder-thumbnail") {
        return null;
      }
      
      return event;
    },
  });
}