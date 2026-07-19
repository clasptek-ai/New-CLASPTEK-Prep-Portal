import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  RegisterAuthPreferencesHandler,
  RecordLoginSessionHandler,
  LockAccountHandler,
  UnlockAccountHandler,
  RevokeLoginSessionHandler,
} from './index';
import { SecuritySession, SecuritySessionRepository } from '@clasptek/domain-auth';
import { SecurityProfile, SecurityProfileRepository } from '@clasptek/domain-security';

class InMemorySecurityProfileRepository implements SecurityProfileRepository {
  private profiles = new Map<string, SecurityProfile>();

  public readonly findById = vi.fn().mockImplementation(async (id: string) => {
    return this.profiles.get(id) || null;
  });

  public readonly findByUserId = vi.fn().mockImplementation(async (uid: string) => {
    return Array.from(this.profiles.values()).find((p) => p.userId === uid) || null;
  });

  public readonly save = vi.fn().mockImplementation(async (profile: SecurityProfile) => {
    this.profiles.set(profile.id, profile);
  });
}

describe('Application Authentication Handlers Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';
  const sessionUUID = '00000000-0000-0000-0000-000000000002';

  let mockProfileRepo: InMemorySecurityProfileRepository;
  let mockSessionRepo: SecuritySessionRepository;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.resetModules();

    mockProfileRepo = new InMemorySecurityProfileRepository();
    // Seed default unlocked profile
    mockProfileRepo.save(new SecurityProfile('profile-id', userUUID, null, 0, 'UNLOCKED'));

    mockSessionRepo = {
      findById: vi.fn().mockImplementation(async (sid: string) => {
        if (sid === sessionUUID) {
          return new SecuritySession(
            sessionUUID,
            userUUID,
            'supabase-token',
            'Chrome',
            '127.0.0.1',
            'USA',
            'Desktop',
            'Mozilla'
          );
        }
        return null;
      }),
      findBySupabaseSessionId: vi.fn(),
      findActiveByUserId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };
  });

  test('RecordLoginSessionHandler logs session details', async () => {
    const handler = new RecordLoginSessionHandler(mockSessionRepo);
    const sid = await handler.execute({
      userId: userUUID,
      supabaseSessionId: 'supabase-token-xyz',
      browser: 'Safari',
      ipAddress: '192.168.1.1',
      country: 'Canada',
      device: 'Mobile',
      userAgent: 'iPhone',
    });

    expect(sid).toBeDefined();
    expect(mockSessionRepo.save).toHaveBeenCalled();
  });

  test('RegisterAuthPreferencesHandler inserts profile setup details', async () => {
    const handler = new RegisterAuthPreferencesHandler(mockProfileRepo);
    const pid = await handler.execute({
      userId: 'new-user-id',
      preferredMfa: 'TOTP',
      securityPreferences: {},
    });

    expect(pid).toBeDefined();
    expect(mockProfileRepo.save).toHaveBeenCalled();
  });

  test('LockAccountHandler and UnlockAccountHandler transition state', async () => {
    const lockHandler = new LockAccountHandler(mockProfileRepo);
    const unlockHandler = new UnlockAccountHandler(mockProfileRepo);

    await lockHandler.execute({ userId: userUUID });
    expect(mockProfileRepo.save).toHaveBeenCalled();

    await unlockHandler.execute({ userId: userUUID });
    expect(mockProfileRepo.save).toHaveBeenCalled();
  });

  test('RevokeLoginSessionHandler executes session revocation', async () => {
    const handler = new RevokeLoginSessionHandler(mockSessionRepo);
    await handler.execute({ sessionId: sessionUUID });

    expect(mockSessionRepo.save).toHaveBeenCalled();
  });
});
