import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly testing
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
      return null;
    }
    
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    
    return event;
  },
});

