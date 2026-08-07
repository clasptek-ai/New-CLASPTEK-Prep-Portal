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
    public readonly updatedAt: Date = new Date(),
    private _lockedAt: Date | null = null,
    private _lockExpiresAt: Date | null = null,
    private _lastFailedAttempt: Date | null = null,
    private _lockCount: number = 0
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

  public get lockedAt(): Date | null {
    return this._lockedAt;
  }

  public get lockExpiresAt(): Date | null {
    return this._lockExpiresAt;
  }

  public get lastFailedAttempt(): Date | null {
    return this._lastFailedAttempt;
  }

  public get lockCount(): number {
    return this._lockCount;
  }

  public updatePreferredMfa(mfaType: string | null): void {
    this._preferredMfa = mfaType;
  }

  public isLockExpired(now: Date = new Date()): boolean {
    if (this._lockStatus !== 'LOCKED') return false;
    if (!this._lockExpiresAt) return false;
    return now.getTime() >= this._lockExpiresAt.getTime();
  }

  public autoUnlockIfExpired(now: Date = new Date()): boolean {
    if (this.isLockExpired(now)) {
      this.unlock();
      return true;
    }
    return false;
  }

  public incrementFailedAttempts(maxAttempts: number = 5): void {
    this._lastFailedAttempt = new Date();
    if (this._lockStatus === 'LOCKED') {
      return;
    }
    this._failedAttempts += 1;
    if (this._failedAttempts >= maxAttempts) {
      this.lockWithProgressiveDuration();
    }
  }

  public resetFailedAttempts(): void {
    this._failedAttempts = 0;
    this._lockStatus = 'UNLOCKED';
    this._lockedAt = null;
    this._lockExpiresAt = null;
  }

  public lockWithProgressiveDuration(now: Date = new Date()): void {
    this._lockStatus = 'LOCKED';
    this._lockedAt = now;
    this._lockCount += 1;

    // Progressive lockout duration: 1st=15m, 2nd=60m, 3rd+=1440m (24h)
    let durationMinutes = 15;
    if (this._lockCount === 2) {
      durationMinutes = 60;
    } else if (this._lockCount >= 3) {
      durationMinutes = 1440;
    }

    this._lockExpiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    this.addDomainEvent(new AccountLockedEvent(this.userId));
  }

  public lock(): void {
    this.lockWithProgressiveDuration();
  }

  public unlock(): void {
    this._lockStatus = 'UNLOCKED';
    this._failedAttempts = 0;
    this._lockedAt = null;
    this._lockExpiresAt = null;
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
