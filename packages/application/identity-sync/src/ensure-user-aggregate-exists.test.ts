import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EnsureUserAggregateExistsService,
  EnsureUserAggregateCommand,
} from './ensure-user-aggregate-exists.service';
import { User, UserId, IdentityRepository } from '@clasptek/domain-identity';
import { SecurityProfileRepository, SecurityProfile } from '@clasptek/domain-security';
import { ConsoleLogger } from '@clasptek/observability';

describe('EnsureUserAggregateExistsService', () => {
  let identityRepo: IdentityRepository;
  let securityProfileRepo: SecurityProfileRepository;
  let logger: ConsoleLogger;
  let service: EnsureUserAggregateExistsService;

  const mockUsers = new Map<string, User>();
  const mockSecProfiles = new Map<string, SecurityProfile>();

  beforeEach(() => {
    mockUsers.clear();
    mockSecProfiles.clear();

    identityRepo = {
      findById: vi.fn(async (id: UserId) => mockUsers.get(id.value) || null),
      save: vi.fn(async (user: User) => {
        mockUsers.set(user.id.value, user);
      }),
    } as unknown as IdentityRepository;

    securityProfileRepo = {
      findByUserId: vi.fn(async (userId: string) => mockSecProfiles.get(userId) || null),
      save: vi.fn(async (profile: SecurityProfile) => {
        mockSecProfiles.set(profile.userId, profile);
      }),
    } as unknown as SecurityProfileRepository;

    logger = new ConsoleLogger('TestLogger');
    service = new EnsureUserAggregateExistsService(identityRepo, securityProfileRepo, logger);
  });

  it('Test 1: User already synchronized - fast-path execution without duplicate provisioning', async () => {
    const userId = 'user-synced-123';
    const existingUser = new User(new UserId(userId), 'ACTIVE', [], null);
    mockUsers.set(userId, existingUser);

    const cmd: EnsureUserAggregateCommand = {
      userId,
      email: 'synced@example.com',
    };

    await service.execute(cmd);

    expect(identityRepo.findById).toHaveBeenCalledWith(new UserId(userId));
    expect(identityRepo.save).not.toHaveBeenCalled();
    expect(securityProfileRepo.findByUserId).not.toHaveBeenCalled();
  });

  it('Test 2: User exists only in auth.users - creates domain aggregate & security profile atomically', async () => {
    const userId = 'user-authonly-456';
    const cmd: EnsureUserAggregateCommand = {
      userId,
      email: 'authonly@example.com',
      firstName: 'Auth',
      lastName: 'Only',
    };

    await service.execute(cmd);

    expect(identityRepo.findById).toHaveBeenCalledWith(new UserId(userId));
    expect(identityRepo.save).toHaveBeenCalled();
    expect(securityProfileRepo.save).toHaveBeenCalled();

    const createdUser = mockUsers.get(userId);
    expect(createdUser).toBeDefined();
    expect(createdUser?.id.value).toBe(userId);

    const createdSecProfile = mockSecProfiles.get(userId);
    expect(createdSecProfile).toBeDefined();
    expect(createdSecProfile?.userId).toBe(userId);
  });

  it('Test 3: Simultaneous login requests - both succeed idempotently without errors', async () => {
    const userId = 'user-concurrent-789';
    const cmd: EnsureUserAggregateCommand = {
      userId,
      email: 'concurrent@example.com',
    };

    const reqA = service.execute(cmd);
    const reqB = service.execute(cmd);

    await expect(Promise.all([reqA, reqB])).resolves.not.toThrow();

    expect(mockUsers.has(userId)).toBe(true);
    expect(mockSecProfiles.has(userId)).toBe(true);
  });
});
