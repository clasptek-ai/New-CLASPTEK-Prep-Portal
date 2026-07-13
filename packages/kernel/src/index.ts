/**
 * @domain Kernel
 * @service Primitives
 * Primitives for Domain-Driven Design core patterns
 */

export abstract class Entity<TId> {
  constructor(public readonly id: TId) {}

  public equals(other?: Entity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this.id === other.id;
  }
}

export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: unknown[] = [];

  public get domainEvents(): readonly unknown[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: unknown): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}

export abstract class ValueObject<TProps extends Record<string, any>> {
  constructor(protected readonly props: TProps) {}

  public equals(other?: ValueObject<TProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}

/**
 * Clock Abstraction for deterministic time operations
 */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}

export class TestClock implements Clock {
  private fixedDate: Date;

  constructor(initialDate: Date = new Date('2026-07-12T00:00:00.000Z')) {
    this.fixedDate = initialDate;
  }

  public now(): Date {
    return this.fixedDate;
  }

  public setDate(date: Date): void {
    this.fixedDate = date;
  }

  public advanceByMs(ms: number): void {
    this.fixedDate = new Date(this.fixedDate.getTime() + ms);
  }
}

/**
 * Reusable Execution context container
 */
export interface ExecutionContext {
  correlationId: string;
  requestId: string;
  traceId?: string;
  actorId?: string;
  timestamp: Date;
}

/**
 * Standard Application Error contracts
 */
export abstract class ApplicationError extends Error {
  public abstract readonly code: string;

  constructor(
    message: string,
    public readonly correlationId?: string,
    public readonly diagnostics?: Record<string, any>,
    public readonly innerError?: Error
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public serialize(env: string = 'production'): Record<string, any> {
    return {
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      diagnostics: this.diagnostics,
      stack: env === 'development' || env === 'test' ? this.stack : undefined,
    };
  }
}

export class ValidationError extends ApplicationError {
  public readonly code = 'VALIDATION_ERROR';
}

export class AuthenticationError extends ApplicationError {
  public readonly code = 'AUTHENTICATION_ERROR';
}

export class AuthorizationError extends ApplicationError {
  public readonly code = 'AUTHORIZATION_ERROR';
}

export class NotFoundError extends ApplicationError {
  public readonly code = 'NOT_FOUND';
}

export class ConflictError extends ApplicationError {
  public readonly code = 'CONFLICT';
}

export class RateLimitError extends ApplicationError {
  public readonly code = 'RATE_LIMIT';
}

export class DependencyError extends ApplicationError {
  public readonly code = 'DEPENDENCY_ERROR';
}

export class InternalError extends ApplicationError {
  public readonly code = 'INTERNAL_ERROR';
}
