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
import { IdentityLookupService } from '@clasptek/application-identity';
import { Logger } from '@clasptek/observability';
import { randomUUID } from 'crypto';

export interface SupabaseAuthEvent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
}

export class IdentitySynchronizer {
  constructor(
    private readonly repository: IdentityRepository,
    private readonly lookupService: IdentityLookupService,
    private readonly logger: Logger
  ) {}

  public async syncUserCreated(event: SupabaseAuthEvent): Promise<void> {
    this.logger.info(`Processing Supabase Auth SIGN_UP event for: ${event.email}`);

    // Check unique constraint via lookup service
    const existing = await this.lookupService.findByLoginIdentifier(event.email);
    if (existing) {
      this.logger.warn(
        `User ${event.email} already exists in domain persistence. Synchronization skipped.`
      );
      return;
    }

    const userIdStr = event.id; // Map to Supabase auth.uid() directly!
    const identityIdStr = randomUUID();
    const profileIdStr = randomUUID();

    const email = new EmailAddress(event.email);
    const firstName = new PersonName(event.firstName || 'New');
    const lastName = new PersonName(event.lastName || 'Student');

    // Standardize identity provider mapping
    const provider: IdentityProvider = (
      event.provider || 'LOCAL'
    ).toUpperCase() as IdentityProvider;

    const user = new User(new UserId(userIdStr), 'CREATED', [], null);
    const identity = new Identity(
      new IdentityId(identityIdStr),
      email,
      provider,
      false,
      event.email
    );
    const profile = new Profile(new ProfileId(profileIdStr), firstName, lastName);

    user.addIdentity(identity);
    user.setProfile(profile);

    await this.repository.save(user);
    this.logger.info(`Successfully synchronized Identity Domain for user: ${userIdStr}`);
  }
}
