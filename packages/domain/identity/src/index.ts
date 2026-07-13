import { Entity, AggregateRoot, ValueObject, ValidationError } from '@clasptek/kernel';
import { z } from 'zod';

/**
 * @domain Identity
 * Core DDD Domain Entities, Value Objects, Specs, Policies and Events
 */

// 1. ID Value Objects
export class UserId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!z.string().uuid().safeParse(value).success) {
      throw new ValidationError('UserId must be a valid UUID string');
    }
    super({ value });
  }
  public get value(): string {
    return this.props.value;
  }
}

export class ProfileId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!z.string().uuid().safeParse(value).success) {
      throw new ValidationError('ProfileId must be a valid UUID string');
    }
    super({ value });
  }
  public get value(): string {
    return this.props.value;
  }
}

export class IdentityId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!z.string().uuid().safeParse(value).success) {
      throw new ValidationError('IdentityId must be a valid UUID string');
    }
    super({ value });
  }
  public get value(): string {
    return this.props.value;
  }
}

// 2. Enums and Vocabulary Primitives
export type UserStatus = 'INVITED' | 'CREATED' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type IdentityProvider =
  'LOCAL' | 'GOOGLE' | 'MICROSOFT' | 'APPLE' | 'AZURE_AD' | 'FACEBOOK' | 'CUSTOM';

export class EmailAddress extends ValueObject<{ value: string }> {
  constructor(value: string) {
    const cleaned = value.trim().toLowerCase();
    if (!z.string().email().safeParse(cleaned).success) {
      throw new ValidationError('EmailAddress is not a valid email syntax');
    }
    super({ value: cleaned });
  }
  public get value(): string {
    return this.props.value;
  }
}

export class PersonName extends ValueObject<{ value: string }> {
  constructor(value: string) {
    const cleaned = value.trim();
    if (cleaned.length < 1 || cleaned.length > 100) {
      throw new ValidationError('PersonName must be between 1 and 100 characters');
    }
    super({ value: cleaned });
  }
  public get value(): string {
    return this.props.value;
  }
}

// 3. Domain Events
export interface DomainEvent {
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export class UserCreatedEvent implements DomainEvent {
  public readonly occurredAt = new Date();
  public readonly eventName = 'UserCreated';
  public readonly payload: Record<string, any>;

  constructor(userId: string, email: string) {
    this.payload = { userId, email };
  }
}

export class IdentityCreatedEvent implements DomainEvent {
  public readonly occurredAt = new Date();
  public readonly eventName = 'IdentityCreated';
  public readonly payload: Record<string, any>;

  constructor(identityId: string, userId: string, provider: IdentityProvider) {
    this.payload = { identityId, userId, provider };
  }
}

export class IdentityArchivedEvent implements DomainEvent {
  public readonly occurredAt = new Date();
  public readonly eventName = 'IdentityArchived';
  public readonly payload: Record<string, any>;

  constructor(userId: string) {
    this.payload = { userId };
  }
}

export class IdentityRestoredEvent implements DomainEvent {
  public readonly occurredAt = new Date();
  public readonly eventName = 'IdentityRestored';
  public readonly payload: Record<string, any>;

  constructor(userId: string) {
    this.payload = { userId };
  }
}

export class ProfileCreatedEvent implements DomainEvent {
  public readonly occurredAt = new Date();
  public readonly eventName = 'ProfileCreated';
  public readonly payload: Record<string, any>;

  constructor(userId: string, profileId: string) {
    this.payload = { userId, profileId };
  }
}

export class ProfileUpdatedEvent implements DomainEvent {
  public readonly occurredAt = new Date();
  public readonly eventName = 'ProfileUpdated';
  public readonly payload: Record<string, any>;

  constructor(userId: string, profileId: string) {
    this.payload = { userId, profileId };
  }
}

// 4. Domain Entities
export class Identity extends Entity<IdentityId> {
  constructor(
    id: IdentityId,
    public readonly email: EmailAddress,
    public readonly provider: IdentityProvider,
    private _isVerified: boolean,
    public readonly loginIdentifier: string
  ) {
    super(id);
  }

  public get isVerified(): boolean {
    return this._isVerified;
  }

  public verify(): void {
    this._isVerified = true;
  }
}

export class Profile extends Entity<ProfileId> {
  constructor(
    id: ProfileId,
    private _firstName: PersonName,
    private _lastName: PersonName,
    public avatar?: string,
    public locale: string = 'en',
    public timeZone: string = 'UTC'
  ) {
    super(id);
  }

  public get firstName(): PersonName {
    return this._firstName;
  }

  public get lastName(): PersonName {
    return this._lastName;
  }

  public update(
    firstName: PersonName,
    lastName: PersonName,
    avatar?: string,
    locale?: string,
    timeZone?: string
  ): void {
    this._firstName = firstName;
    this._lastName = lastName;
    if (avatar !== undefined) this.avatar = avatar;
    if (locale !== undefined) this.locale = locale;
    if (timeZone !== undefined) this.timeZone = timeZone;
  }
}

// 5. User Aggregate Root (Lifecycle State Machine & Invariants)
export class User extends AggregateRoot<UserId> {
  private _status: UserStatus;
  private _identities: Identity[];
  private _profile: Profile | null;
  private _version: number;

  constructor(
    id: UserId,
    status: UserStatus,
    identities: Identity[],
    profile: Profile | null,
    version: number = 1
  ) {
    super(id);
    this._status = status;
    this._identities = identities;
    this._profile = profile;
    this._version = version;
  }

  public get status(): UserStatus {
    return this._status;
  }

  public get identities(): readonly Identity[] {
    return this._identities;
  }

  public get profile(): Profile | null {
    return this._profile;
  }

  public get version(): number {
    return this._version;
  }

  public incrementVersion(): void {
    this._version++;
  }

  public addIdentity(identity: Identity): void {
    if (!new UserIsEditableSpecification().isSatisfiedBy(this)) {
      throw new ValidationError('User profile changes are prohibited in the current state');
    }
    const exists = this._identities.some(
      (id) =>
        id.loginIdentifier === identity.loginIdentifier || id.email.value === identity.email.value
    );
    if (exists) {
      throw new ValidationError('Login identifier or email address is already bound to this user');
    }
    this._identities.push(identity);
    this.addDomainEvent(
      new IdentityCreatedEvent(identity.id.value, this.id.value, identity.provider)
    );
  }

  public setProfile(profile: Profile): void {
    if (!new UserIsEditableSpecification().isSatisfiedBy(this)) {
      throw new ValidationError('User profile changes are prohibited in the current state');
    }
    const isNew = this._profile === null;
    this._profile = profile;
    if (isNew) {
      this.addDomainEvent(new ProfileCreatedEvent(this.id.value, profile.id.value));
    } else {
      this.addDomainEvent(new ProfileUpdatedEvent(this.id.value, profile.id.value));
    }
  }

  // State Machine transitions
  public transitionTo(newStatus: UserStatus): void {
    const current = this._status;

    // Strict validation check transitions logic
    const transitions: Record<UserStatus, UserStatus[]> = {
      INVITED: ['CREATED'],
      CREATED: ['ACTIVE'],
      ACTIVE: ['SUSPENDED', 'ARCHIVED'],
      SUSPENDED: ['ACTIVE', 'ARCHIVED'],
      ARCHIVED: ['ACTIVE'], // restoration state
    };

    if (!transitions[current]?.includes(newStatus)) {
      throw new ValidationError(
        `Forbidden lifecycle transition from "${current}" to "${newStatus}"`
      );
    }

    this._status = newStatus;

    if (newStatus === 'ARCHIVED') {
      this.addDomainEvent(new IdentityArchivedEvent(this.id.value));
    } else if (current === 'ARCHIVED' && newStatus === 'ACTIVE') {
      this.addDomainEvent(new IdentityRestoredEvent(this.id.value));
    }
  }
}

// 6. Reusable Specifications
export class UserIsEditableSpecification {
  public isSatisfiedBy(user: User): boolean {
    return user.status !== 'ARCHIVED';
  }
}

export class ProfileCompleteSpecification {
  public isSatisfiedBy(profile: Profile): boolean {
    return profile.firstName.value.length > 0 && profile.lastName.value.length > 0;
  }
}

// 7. Identity Policies
export class IdentityPolicy {
  public static isSystemAdministrator(userId: string): boolean {
    // Reserved for admin protection checks
    return userId === '00000000-0000-0000-0000-000000000000';
  }

  public static canArchiveUser(actorId: string, targetUser: User): boolean {
    if (IdentityPolicy.isSystemAdministrator(targetUser.id.value)) {
      throw new ValidationError('Cannot archive the system administrator account');
    }
    if (actorId === targetUser.id.value) {
      throw new ValidationError('Users cannot self-archive their active workspace profiles');
    }
    return true;
  }
}

// 8. Domain Repository Interface
export interface IdentityRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
