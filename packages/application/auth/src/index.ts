import { SecuritySession, SecuritySessionRepository } from '@clasptek/domain-auth';
import { SecurityProfile, SecurityProfileRepository } from '@clasptek/domain-security';
import { NotFoundError, ConflictError } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// 1. Commands & Queries Interfaces

export interface RegisterAuthPreferencesCommand {
  userId: string;
  preferredMfa?: string;
  securityPreferences?: Record<string, any>;
}

export interface RecordLoginSessionCommand {
  userId: string;
  supabaseSessionId: string;
  browser: string;
  ipAddress: string;
  country: string;
  device: string;
  userAgent: string;
}

export interface LockAccountCommand {
  userId: string;
}

export interface UnlockAccountCommand {
  userId: string;
}

export interface RevokeLoginSessionCommand {
  sessionId: string;
}

// 2. Handlers Implementation

export class RegisterAuthPreferencesHandler {
  constructor(private readonly securityProfileRepo: SecurityProfileRepository) {}

  public async execute(command: RegisterAuthPreferencesCommand): Promise<string> {
    const existing = await this.securityProfileRepo.findByUserId(command.userId);
    if (existing) {
      throw new ConflictError('Security profile already exists for this user aggregate');
    }

    const newProfile = new SecurityProfile(
      randomUUID(),
      command.userId,
      command.preferredMfa || null,
      0,
      'UNLOCKED',
      command.securityPreferences || {}
    );

    await this.securityProfileRepo.save(newProfile);
    return newProfile.id;
  }
}

export class RecordLoginSessionHandler {
  constructor(private readonly sessionRepo: SecuritySessionRepository) {}

  public async execute(command: RecordLoginSessionCommand): Promise<string> {
    const newSession = new SecuritySession(
      randomUUID(),
      command.userId,
      command.supabaseSessionId,
      command.browser,
      command.ipAddress,
      command.country,
      command.device,
      command.userAgent
    );

    await this.sessionRepo.save(newSession);
    return newSession.id;
  }
}

export class LockAccountHandler {
  constructor(private readonly securityProfileRepo: SecurityProfileRepository) {}

  public async execute(command: LockAccountCommand): Promise<void> {
    const profile = await this.securityProfileRepo.findByUserId(command.userId);
    if (!profile) {
      throw new NotFoundError('Security profile not found for user aggregate');
    }
    profile.lock();
    await this.securityProfileRepo.save(profile);
  }
}

export class UnlockAccountHandler {
  constructor(private readonly securityProfileRepo: SecurityProfileRepository) {}

  public async execute(command: UnlockAccountCommand): Promise<void> {
    const profile = await this.securityProfileRepo.findByUserId(command.userId);
    if (!profile) {
      throw new NotFoundError('Security profile not found for user aggregate');
    }
    profile.unlock();
    await this.securityProfileRepo.save(profile);
  }
}

export class RevokeLoginSessionHandler {
  constructor(private readonly sessionRepo: SecuritySessionRepository) {}

  public async execute(command: RevokeLoginSessionCommand): Promise<void> {
    const session = await this.sessionRepo.findById(command.sessionId);
    if (!session) {
      throw new NotFoundError('Active session not found in registry');
    }
    session.revoke();
    await this.sessionRepo.save(session);
  }
}
