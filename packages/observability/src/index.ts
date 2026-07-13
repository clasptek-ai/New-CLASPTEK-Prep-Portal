/**
 * @service Observability
 * Structured logging, tracing, metrics, and context propagation boundaries
 */

export interface Logger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}

export interface LoggerMetadata {
  env: string;
  configVersion: string;
  service: string;
}

export function redact(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(redact);
  }

  const redactedKeys = /password|token|cookie|secret|key|answer|submission|audio|payload/i;
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (redactedKeys.test(key)) {
      result[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      result[key] = redact(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export class ConsoleLogger implements Logger {
  private readonly env: string;
  private readonly configVersion: string;
  private readonly service: string;

  constructor(
    private readonly moduleName: string,
    metadata?: Partial<LoggerMetadata>
  ) {
    this.env = metadata?.env || process.env.NODE_ENV || 'development';
    this.configVersion = metadata?.configVersion || process.env.CONFIG_VERSION || '1.0.0';
    this.service = metadata?.service || 'ClasptekApp';
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      module: this.moduleName,
      message,
      configVersion: this.configVersion,
      env: this.env,
      correlationId: context?.correlationId || context?.executionContext?.correlationId,
      requestId: context?.requestId || context?.executionContext?.requestId,
      traceId: context?.traceId || context?.executionContext?.traceId,
      jobId: context?.jobId,
      context: context ? redact(context) : undefined,
    };

    if (this.env === 'development' || this.env === 'test') {
      // Readable console layout for local development
      const ctxStr = logObject.context ? ` | context: ${JSON.stringify(logObject.context)}` : '';
      const traceStr = logObject.correlationId ? ` [corr:${logObject.correlationId}]` : '';
      return `[${logObject.timestamp}] ${level} (${logObject.module})${traceStr}: ${message}${ctxStr}`;
    }

    return JSON.stringify(logObject);
  }

  public info(message: string, context?: Record<string, any>): void {
    // eslint-disable-next-line no-console
    console.info(this.formatMessage('INFO', message, context));
  }

  public warn(message: string, context?: Record<string, any>): void {
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('WARN', message, context));
  }

  public error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorDetails = error
      ? {
          errorMessage: error.message,
          errorStack: this.env === 'production' ? undefined : error.stack,
        }
      : undefined;

    // eslint-disable-next-line no-console
    console.error(
      this.formatMessage('ERROR', message, {
        ...errorDetails,
        ...context,
      })
    );
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (this.env === 'development' || this.env === 'test') {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }
}

/**
 * OpenTelemetry boundary interfaces
 */
export interface Tracer {
  startSpan(name: string, context?: any): any;
}

export interface Meter {
  counter(name: string, description?: string): any;
  gauge(name: string, description?: string): any;
}

export interface ContextPropagator {
  inject(carrier: any, context?: any): void;
  extract(carrier: any): any;
}

export class NoopTracer implements Tracer {
  public startSpan(_name: string, _context?: any) {
    return { end: () => {} };
  }
}

export class NoopMeter implements Meter {
  public counter(_name: string, _description?: string) {
    return { add: () => {} };
  }
  public gauge(_name: string, _description?: string) {
    return { record: () => {} };
  }
}

export class NoopContextPropagator implements ContextPropagator {
  public inject(_carrier: any, _context?: any): void {}
  public extract(_carrier: any) {
    return {};
  }
}
