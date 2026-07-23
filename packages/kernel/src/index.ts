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

/**
 * Result pattern for type-safe success or failure outcomes
 */
export class Result<TValue, TError = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: TValue,
    private readonly _error?: TError
  ) {}

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public get value(): TValue {
    if (!this._isSuccess) {
      throw new Error(`Cannot retrieve value of a failed result: ${this._error}`);
    }
    return this._value!;
  }

  public get error(): TError {
    if (this._isSuccess) {
      throw new Error('Cannot retrieve error of a successful result.');
    }
    return this._error!;
  }

  public static success<TValue, TError = Error>(value: TValue): Result<TValue, TError> {
    return new Result<TValue, TError>(true, value, undefined);
  }

  public static failure<TValue, TError = Error>(error: TError): Result<TValue, TError> {
    return new Result<TValue, TError>(false, undefined, error);
  }
}

/**
 * Guard assertions for validation invariants
 */
export class Guard {
  public static againstNullOrUndefined(value: any, argumentName: string): void {
    if (value === null || value === undefined) {
      throw new ValidationError(`${argumentName} cannot be null or undefined.`);
    }
  }

  public static againstEmptyString(value: string, argumentName: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError(`${argumentName} cannot be empty.`);
    }
  }

  public static againstOutOfRange(
    value: number,
    min: number,
    max: number,
    argumentName: string
  ): void {
    if (value < min || value > max) {
      throw new ValidationError(`${argumentName} must be between ${min} and ${max}.`);
    }
  }
}

/**
 * Specification pattern for encapsulated business rules
 */
export abstract class Specification<T> {
  public abstract isSatisfiedBy(candidate: T): boolean;

  public and(other: Specification<T>): Specification<T> {
    return new AndSpecification<T>(this, other);
  }

  public or(other: Specification<T>): Specification<T> {
    return new OrSpecification<T>(this, other);
  }

  public not(): Specification<T> {
    return new NotSpecification<T>(this);
  }
}

class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
