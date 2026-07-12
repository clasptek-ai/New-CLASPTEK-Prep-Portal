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
