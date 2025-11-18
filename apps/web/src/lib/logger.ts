/**
 * Structured Logging Utility
 * Provides consistent logging with levels, context, and request tracing
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  requestId?: string;
  userId?: string;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;
  private requestId?: string;
  private userId?: string;

  constructor() {
    // Set minimum log level based on environment
    this.minLevel =
      process.env.NODE_ENV === 'production'
        ? LogLevel.INFO
        : LogLevel.DEBUG;
  }

  /**
   * Set request ID for tracing
   */
  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  /**
   * Set user ID for user-specific logging
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  /**
   * Format log entry
   */
  private formatLog(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message,
    ];

    if (entry.requestId) {
      parts.push(`[Request: ${entry.requestId}]`);
    }

    if (entry.userId) {
      parts.push(`[User: ${entry.userId}]`);
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`[Context: ${JSON.stringify(entry.context)}]`);
    }

    if (entry.error) {
      parts.push(`[Error: ${entry.error.message}]`);
      if (entry.error.stack) {
        parts.push(`[Stack: ${entry.error.stack}]`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Create log entry
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      requestId: this.requestId,
      userId: this.userId,
      error,
    };

    const formatted = this.formatLog(entry);

    // Console output with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }

    // In production, send to logging service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production' && level === LogLevel.ERROR) {
      // Send to error tracking service
      if (typeof window !== 'undefined') {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error || new Error(message), {
            contexts: {
              log: {
                level,
                message,
                context,
              },
            },
          });
        }).catch(() => {
          // Sentry not available
        });
      }
    }
  }

  /**
   * Debug log
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning log
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, statusCode?: number, duration?: number) {
    this.info('API Request', {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log API response
   */
  logResponse(method: string, url: string, statusCode: number, duration: number) {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, 'API Response', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    });
  }

  /**
   * Log database query
   */
  logQuery(table: string, operation: string, duration?: number) {
    this.debug('Database Query', {
      table,
      operation,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log payment transaction
   */
  logPayment(
    gateway: string,
    transactionId: string,
    amount: number,
    status: string
  ) {
    this.info('Payment Transaction', {
      gateway,
      transactionId,
      amount,
      status,
    });
  }

  /**
   * Log booking event
   */
  logBooking(bookingId: string, event: string, context?: LogContext) {
    this.info('Booking Event', {
      bookingId,
      event,
      ...context,
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Generate request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

