import {
  User,
  UserId,
  Identity,
  IdentityId,
  Profile,
  ProfileId,
  EmailAddress,
  PersonName,
  IdentityProvider,
  IdentityRepository,
  IdentityPolicy,
} from '@clasptek/domain-identity';
import { ValidationError, NotFoundError, ConflictError } from '@clasptek/kernel';

/**
 * @application Identity
 * Application Command/Query Use Case Handlers and Query Interfaces
 */

// 1. DTO Primitives
export interface CreateUserCommand {
  email: string;
  firstName: string;
  lastName: string;
  provider: IdentityProvider;
  loginIdentifier: string;
}

export interface UpdateProfileCommand {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  locale?: string;
  timeZone?: string;
}

export interface ArchiveUserCommand {
  userId: string;
  actorId: string;
}

export interface RestoreUserCommand {
  userId: string;
}

// 2. Identity Query Lookup Contract
export interface IdentityLookupService {
  findByLoginIdentifier(loginIdentifier: string): Promise<string | null>;
}

// 3. Command Handlers
export class CreateUserHandler {
  constructor(
    private readonly repository: IdentityRepository,
    private readonly lookupService: IdentityLookupService
  ) {}

  public async execute(command: CreateUserCommand): Promise<string> {
    // Validate uniqueness specification via lookup service
    const existingUserId = await this.lookupService.findByLoginIdentifier(command.loginIdentifier);
    if (existingUserId) {
      throw new ConflictError(
        `User login identifier "${command.loginIdentifier}" is already registered`
      );
    }

    const userIdStr = crypto.randomUUID();
    const identityIdStr = crypto.randomUUID();
    const profileIdStr = crypto.randomUUID();

    const email = new EmailAddress(command.email);
    const firstName = new PersonName(command.firstName);
    const lastName = new PersonName(command.lastName);

    const user = new User(new UserId(userIdStr), 'CREATED', [], null);

    const identity = new Identity(
      new IdentityId(identityIdStr),
      email,
      command.provider,
      false,
      command.loginIdentifier
    );

    const profile = new Profile(new ProfileId(profileIdStr), firstName, lastName);

    user.addIdentity(identity);
    user.setProfile(profile);

    // Save aggregate root
    await this.repository.save(user);

    return userIdStr;
  }
}

export class UpdateProfileHandler {
  constructor(private readonly repository: IdentityRepository) {}

  public async execute(command: UpdateProfileCommand): Promise<void> {
    const user = await this.repository.findById(new UserId(command.userId));
    if (!user) {
      throw new NotFoundError(`User with ID "${command.userId}" not found`);
    }

    const profile = user.profile;
    if (!profile) {
      throw new ValidationError('User profile entity is not initialized');
    }

    profile.update(
      new PersonName(command.firstName),
      new PersonName(command.lastName),
      command.avatar,
      command.locale,
      command.timeZone
    );

    user.setProfile(profile);
    user.incrementVersion();

    await this.repository.save(user);
  }
}

export class ArchiveUserHandler {
  constructor(private readonly repository: IdentityRepository) {}

  public async execute(command: ArchiveUserCommand): Promise<void> {
    const user = await this.repository.findById(new UserId(command.userId));
    if (!user) {
      throw new NotFoundError(`User with ID "${command.userId}" not found`);
    }

    // Apply policy guard
    IdentityPolicy.canArchiveUser(command.actorId, user);

    user.transitionTo('ARCHIVED');
    user.incrementVersion();

    await this.repository.save(user);
  }
}

export class RestoreUserHandler {
  constructor(private readonly repository: IdentityRepository) {}

  public async execute(command: RestoreUserCommand): Promise<void> {
    const user = await this.repository.findById(new UserId(command.userId));
    if (!user) {
      throw new NotFoundError(`User with ID "${command.userId}" not found`);
    }

    user.transitionTo('ACTIVE');
    user.incrementVersion();

    await this.repository.save(user);
  }
}
