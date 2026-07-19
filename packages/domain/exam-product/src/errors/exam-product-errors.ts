export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConcurrencyError extends DomainError {
  constructor(message: string = 'Concurrency conflict detected') {
    super(message);
    this.name = 'ConcurrencyError';
  }
}
