import {
  User,
  UserId,
  Identity,
  IdentityId,
  Profile,
  ProfileId,
  EmailAddress,
  PersonName,
  IdentityRepository,
  IdentityProvider,
} from '@clasptek/domain-identity';
import { SecurityProfileRepository, SecurityProfile } from '@clasptek/domain-security';
import { Logger } from '@clasptek/observability';
import { randomUUID } from 'crypto';

export interface EnsureUserAggregateCommand {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  provider?: string;
}

export class EnsureUserAggregateExistsService {
  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly securityProfileRepository: SecurityProfileRepository,
    private readonly logger: Logger
  ) {}

  public async execute(command: EnsureUserAggregateCommand): Promise<void> {
    const userId = command.userId;

    // Fast-path: Check if Domain User aggregate already exists in persistence
    const existingUser = await this.identityRepository.findById(new UserId(userId));
    if (existingUser) {
      this.logger.info(
        `[EnsureUserAggregateExists] Fast-path: User aggregate ${userId} verified in persistence.`
      );
      return;
    }

    this.logger.warn(
      `[EnsureUserAggregateExists] Provisioning missing User aggregate ${userId} (${command.email}) atomically.`
    );

    // Build Domain User, Identity, and Profile entities
    const identityIdStr = randomUUID();
    const profileIdStr = randomUUID();

    const email = new EmailAddress(command.email);
    const firstName = new PersonName(command.firstName || 'Clasptek');
    const lastName = new PersonName(command.lastName || 'User');
    const providerStr: IdentityProvider = (
      command.provider || 'LOCAL'
    ).toUpperCase() as IdentityProvider;

    const user = new User(new UserId(userId), 'ACTIVE', [], null);
    const identity = new Identity(
      new IdentityId(identityIdStr),
      email,
      providerStr,
      true,
      command.email
    );
    const profile = new Profile(new ProfileId(profileIdStr), firstName, lastName);

    user.addIdentity(identity);
    user.setProfile(profile);

    // Save User Aggregate (atomically saves users, identities, profiles inside transaction)
    await this.identityRepository.save(user);

    // Ensure Security Profile exists
    let secProfile = await this.securityProfileRepository.findByUserId(userId);
    if (!secProfile) {
      secProfile = new SecurityProfile(randomUUID(), userId, null, 0, 'UNLOCKED', {});
      await this.securityProfileRepository.save(secProfile);
    }

    this.logger.info(
      `[EnsureUserAggregateExists] Atomically provisioned User aggregate & Security Profile for: ${userId}`
    );
  }
}
