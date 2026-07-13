import { AggregateRoot } from '@clasptek/kernel';

export type LockStatus = 'UNLOCKED' | 'LOCKED';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class SecurityProfile extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly userId: string,
    private _preferredMfa: string | null,
    private _failedAttempts: number = 0,
    private _lockStatus: LockStatus = 'UNLOCKED',
    public readonly securityPreferences: Record<string, any> = {},
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    super(id);
  }

  public get preferredMfa(): string | null {
    return this._preferredMfa;
  }

  public get failedAttempts(): number {
    return this._failedAttempts;
  }

  public get lockStatus(): LockStatus {
    return this._lockStatus;
  }

  public updatePreferredMfa(mfaType: string | null): void {
    this._preferredMfa = mfaType;
  }

  public incrementFailedAttempts(maxAttempts: number = 5): void {
    if (this._lockStatus === 'LOCKED') {
      return;
    }
    this._failedAttempts += 1;
    if (this._failedAttempts >= maxAttempts) {
      this.lock();
    }
  }

  public resetFailedAttempts(): void {
    this._failedAttempts = 0;
  }

  public lock(): void {
    if (this._lockStatus === 'LOCKED') {
      throw new DomainError('Account is already locked');
    }
    this._lockStatus = 'LOCKED';
    this.addDomainEvent(new AccountLockedEvent(this.userId));
  }

  public unlock(): void {
    if (this._lockStatus === 'UNLOCKED') {
      throw new DomainError('Account is already unlocked');
    }
    this._lockStatus = 'UNLOCKED';
    this._failedAttempts = 0;
    this.addDomainEvent(new AccountUnlockedEvent(this.userId));
  }
}

export interface SecurityProfileRepository {
  findById(id: string): Promise<SecurityProfile | null>;
  findByUserId(userId: string): Promise<SecurityProfile | null>;
  save(profile: SecurityProfile): Promise<void>;
}

export class AccountLockedEvent {
  constructor(public readonly userId: string) {}
}

export class AccountUnlockedEvent {
  constructor(public readonly userId: string) {}
}
