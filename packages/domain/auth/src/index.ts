import { AggregateRoot } from '@clasptek/kernel';
import { z } from 'zod';

export type AuthenticationMethodType = 'PASSWORD' | 'TOTP' | 'WEBAUTHN' | 'MAGIC_LINK';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class SessionId {
  constructor(public readonly value: string) {
    z.string().min(1, 'Session ID cannot be empty').parse(value);
  }

  public equals(other?: SessionId): boolean {
    return other?.value === this.value;
  }
}

export class DeviceFingerprint {
  constructor(public readonly value: string) {
    z.string().min(1, 'Device fingerprint cannot be empty').parse(value);
  }

  public equals(other?: DeviceFingerprint): boolean {
    return other?.value === this.value;
  }
}

export class SecuritySession extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly userId: string,
    public readonly supabaseSessionId: string,
    public readonly browser: string,
    public readonly ipAddress: string,
    public readonly country: string,
    public readonly device: string,
    public readonly userAgent: string,
    public readonly loginTimestamp: Date = new Date(),
    private _revokedByAdmin: boolean = false,
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    super(id);
  }

  public get revokedByAdmin(): boolean {
    return this._revokedByAdmin;
  }

  public revoke(): void {
    if (this._revokedByAdmin) {
      throw new DomainError('Session is already revoked');
    }
    this._revokedByAdmin = true;
    this.addDomainEvent(new SessionRevokedEvent(this.id, this.userId));
  }
}

export class AuthenticationMethod {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly methodType: AuthenticationMethodType,
    private _isEnabled: boolean = true,
    public readonly preferences: Record<string, any> = {},
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public disable(): void {
    this._isEnabled = false;
  }

  public enable(): void {
    this._isEnabled = true;
  }
}

export class TrustedDevice {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly deviceFingerprint: DeviceFingerprint,
    public readonly trustExpiresAt: Date,
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public isTrustValid(): boolean {
    return this.trustExpiresAt.getTime() > Date.now();
  }
}

export class SessionRevokedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string
  ) {}
}

export interface SecuritySessionRepository {
  findById(id: string): Promise<SecuritySession | null>;
  findBySupabaseSessionId(supabaseSessionId: string): Promise<SecuritySession | null>;
  findActiveByUserId(userId: string): Promise<SecuritySession[]>;
  save(session: SecuritySession): Promise<void>;
}

export interface AuthenticationMethodRepository {
  findByUserId(userId: string): Promise<AuthenticationMethod[]>;
  save(method: AuthenticationMethod): Promise<void>;
}

export interface TrustedDeviceRepository {
  findByUserId(userId: string): Promise<TrustedDevice[]>;
  save(device: TrustedDevice): Promise<void>;
}
