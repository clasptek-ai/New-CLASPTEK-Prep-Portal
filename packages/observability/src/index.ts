/**
 * @service Observability
 * Structured logging and tracing primitives
 */

export interface Logger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly moduleName: string) {}

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      ...context,
    });
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
    // eslint-disable-next-line no-console
    console.error(
      this.formatMessage('ERROR', message, {
        errorMessage: error?.message,
        errorStack: error?.stack,
        ...context,
      })
    );
  }
}
