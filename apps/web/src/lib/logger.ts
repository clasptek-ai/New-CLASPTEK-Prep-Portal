/**
 * Clasptek Structured Logger
 *
 * Production-grade structured JSON logger with:
 * - Correlation ID (requestId) on every entry
 * - Sentry error capture (when SENTRY_DSN is configured)
 * - Console fallback in development
 * - Zero silent swallowing — every error surfaces
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  email?: string;
  endpoint?: string;
  attemptId?: string;
  catalogId?: string;
  duration?: number;
  status?: number;
  [key: string]: unknown;
}

interface LogEntry extends LogContext {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
}

const SERVICE_NAME = 'clasptek-prep-portal';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function formatEntry(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    ...context,
  };
}

function output(entry: LogEntry): void {
  const json = JSON.stringify(entry);

  switch (entry.level) {
    case 'debug':
      if (!IS_PRODUCTION) console.debug(json);
      break;
    case 'info':
      console.log(json);
      break;
    case 'warn':
      console.warn(json);
      break;
    case 'error':
      console.error(json);
      // Forward to Sentry if configured (server-side only)
      if (IS_PRODUCTION && typeof process !== 'undefined') {
        try {
          // Dynamic import with ts-expect-error for optional Sentry package
          // @ts-expect-error Optional dependency
          void import(/* webpackIgnore: true */ '@sentry/nextjs')
            .then((sentry: any) => {
              if (!sentry) return;
              const { captureException, captureMessage, withScope } = sentry;
              if (entry.error instanceof Error) {
                withScope((scope: any) => {
                  scope.setTag('requestId', entry.requestId || 'unknown');
                  scope.setTag('userId', String(entry.userId || 'anonymous'));
                  scope.setExtra('context', entry);
                  captureException(entry.error as Error);
                });
              } else {
                captureMessage(entry.message, {
                  level: 'error',
                  extra: entry,
                  tags: { requestId: entry.requestId || 'unknown' },
                });
              }
            })
            .catch(() => {
              /* Sentry unavailable — log only */
            });
        } catch {
          /* Sentry not installed */
        }
      }
      break;
  }
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    output(formatEntry('debug', message, context));
  },

  info(message: string, context?: LogContext): void {
    output(formatEntry('info', message, context));
  },

  warn(message: string, context?: LogContext): void {
    output(formatEntry('warn', message, context));
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    const entry = formatEntry('error', message, {
      ...context,
      error: error instanceof Error ? error : undefined,
      errorMessage: error instanceof Error ? error.message : String(error ?? ''),
      stack: error instanceof Error ? error.stack : undefined,
    });
    output(entry);
  },

  /** Log a standardised auth event */
  auth(
    event:
      | 'REGISTER'
      | 'LOGIN'
      | 'LOGIN_FAILED'
      | 'LOGOUT'
      | 'PASSWORD_RESET_REQUEST'
      | 'PASSWORD_RESET_SUCCESS'
      | 'EMAIL_VERIFIED',
    context: LogContext
  ): void {
    output(
      formatEntry('info', `[AUTH] ${event}`, {
        ...context,
        authEvent: event,
      })
    );
  },

  /** Log a standardised assessment lifecycle event */
  assessment(
    event:
      | 'ATTEMPT_CREATED'
      | 'ATTEMPT_RESUMED'
      | 'ANSWER_SAVED'
      | 'SUBMITTED'
      | 'RESULT_GENERATED'
      | 'ATTEMPT_EXPIRED'
      | 'ATTEMPT_ABANDONED',
    context: LogContext
  ): void {
    output(
      formatEntry('info', `[ASSESSMENT] ${event}`, {
        ...context,
        assessmentEvent: event,
      })
    );
  },

  /** Log a standardised admin event */
  admin(
    event: 'STUDENT_VIEWED' | 'ATTEMPT_REVIEWED' | 'QUESTION_IMPORTED' | 'USER_ROLE_CHANGED',
    context: LogContext
  ): void {
    output(
      formatEntry('info', `[ADMIN] ${event}`, {
        ...context,
        adminEvent: event,
      })
    );
  },

  /** Log an API request/response cycle */
  api(context: {
    requestId: string;
    method: string;
    endpoint: string;
    status: number;
    duration: number;
    userId?: string;
    error?: string;
  }): void {
    const level: LogLevel = context.status >= 500 ? 'error' : context.status >= 400 ? 'warn' : 'info';
    output(
      formatEntry(level, `[API] ${context.method} ${context.endpoint} → ${context.status}`, {
        ...context,
      })
    );
  },
};

export default logger;
