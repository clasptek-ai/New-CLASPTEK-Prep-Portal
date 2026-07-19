import { describe, test, expect, vi, beforeEach } from 'vitest';
import { IdentitySynchronizer } from './index';
import { IdentityRepository } from '@clasptek/domain-identity';
import { IdentityLookupService } from '@clasptek/application-identity';
import { Logger } from '@clasptek/observability';

describe('Application Identity Sync Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';

  let mockRepo: IdentityRepository;
  let mockLookup: IdentityLookupService;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.resetModules();

    mockRepo = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    mockLookup = {
      findByLoginIdentifier: vi.fn().mockImplementation(async (loginId: string) => {
        if (loginId === 'duplicate@domain.com') {
          return userUUID;
        }
        return null;
      }),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
  });

  test('syncUserCreated runs and maps user aggregate successfully', async () => {
    const synchronizer = new IdentitySynchronizer(mockRepo, mockLookup, mockLogger);

    await synchronizer.syncUserCreated({
      id: userUUID,
      email: 'new.student@domain.com',
      firstName: 'Bob',
      lastName: 'Smith',
      provider: 'LOCAL',
    });

    expect(mockRepo.save).toHaveBeenCalled();
  });

  test('syncUserCreated bypasses if already synchronized', async () => {
    const synchronizer = new IdentitySynchronizer(mockRepo, mockLookup, mockLogger);

    await synchronizer.syncUserCreated({
      id: userUUID,
      email: 'duplicate@domain.com',
      firstName: 'Bob',
      lastName: 'Smith',
      provider: 'LOCAL',
    });

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalled();
  });
});
