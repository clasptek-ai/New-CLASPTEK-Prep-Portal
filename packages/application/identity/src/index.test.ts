import { describe, test, expect, vi } from 'vitest';
import { CreateUserHandler, UpdateProfileHandler, IdentityLookupService } from './index';
import {
  User,
  UserId,
  Profile,
  ProfileId,
  PersonName,
  IdentityRepository,
} from '@clasptek/domain-identity';

describe('Identity Application Handlers Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';

  // Mock repository implementation
  const mockRepo: IdentityRepository = {
    findById: vi.fn().mockImplementation(async (id: UserId) => {
      if (id.value === userUUID) {
        return new User(
          new UserId(userUUID),
          'ACTIVE',
          [],
          new Profile(
            new ProfileId('00000000-0000-0000-0000-000000000003'),
            new PersonName('John'),
            new PersonName('Doe')
          ),
          1
        );
      }
      return null;
    }),
    save: vi.fn().mockResolvedValue(undefined),
  };

  const mockLookup: IdentityLookupService = {
    findByLoginIdentifier: vi.fn().mockImplementation(async (loginId: string) => {
      if (loginId === 'duplicate@domain.com') {
        return userUUID;
      }
      return null;
    }),
  };

  test('CreateUserHandler creates new aggregates and prevents duplicates', async () => {
    const handler = new CreateUserHandler(mockRepo, mockLookup);

    // Try duplicate email
    await expect(
      handler.execute({
        email: 'duplicate@domain.com',
        firstName: 'Alice',
        lastName: 'Smith',
        provider: 'LOCAL',
        loginIdentifier: 'duplicate@domain.com',
      })
    ).rejects.toThrow('User login identifier "duplicate@domain.com" is already registered');

    // Valid create user
    const newId = await handler.execute({
      email: 'new.student@domain.com',
      firstName: 'Alice',
      lastName: 'Smith',
      provider: 'LOCAL',
      loginIdentifier: 'new.student@domain.com',
    });

    expect(newId).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalled();
  });

  test('UpdateProfileHandler fetches user and updates fields', async () => {
    const handler = new UpdateProfileHandler(mockRepo);

    await handler.execute({
      userId: userUUID,
      firstName: 'Bob',
      lastName: 'Johnson',
      avatar: 'https://avatar.com/bob',
      locale: 'fr',
      timeZone: 'Europe/Paris',
    });

    expect(mockRepo.save).toHaveBeenCalled();
  });
});
