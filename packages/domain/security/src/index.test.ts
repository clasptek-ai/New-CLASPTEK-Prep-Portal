import { describe, test, expect } from 'vitest';
import { SecurityProfile, AccountLockedEvent, AccountUnlockedEvent } from './index';

describe('Domain Security Aggregate Unit Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';

  test('SecurityProfile initiates with unlocked defaults', () => {
    const profile = new SecurityProfile('profile-id', userUUID, null);

    expect(profile.lockStatus).toBe('UNLOCKED');
    expect(profile.failedAttempts).toBe(0);
  });

  test('failed attempts increment leads to lockout condition', () => {
    const profile = new SecurityProfile('profile-id', userUUID, null);

    profile.incrementFailedAttempts(3);
    profile.incrementFailedAttempts(3);
    profile.incrementFailedAttempts(3);

    expect(profile.lockStatus).toBe('LOCKED');

    const events = profile.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(AccountLockedEvent);
  });

  test('unlock resets brute force counters', () => {
    const profile = new SecurityProfile('profile-id', userUUID, null, 4, 'LOCKED');

    profile.unlock();

    expect(profile.lockStatus).toBe('UNLOCKED');
    expect(profile.failedAttempts).toBe(0);

    const events = profile.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(AccountUnlockedEvent);
  });
});
