import { describe, test, expect } from 'vitest';
import { SecuritySession, SessionId, DeviceFingerprint, SessionRevokedEvent } from './index';

describe('Domain Auth Entities Unit Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';
  const sessionUUID = '00000000-0000-0000-0000-000000000002';

  test('SessionId initialization requires values', () => {
    const sId = new SessionId(sessionUUID);
    expect(sId.value).toBe(sessionUUID);

    expect(() => new SessionId('')).toThrow();
  });

  test('DeviceFingerprint verifies empty checks', () => {
    const deviceFp = new DeviceFingerprint('chrome-mac-fingerprint');
    expect(deviceFp.value).toBe('chrome-mac-fingerprint');

    expect(() => new DeviceFingerprint('')).toThrow();
  });

  test('SecuritySession initialization defaults', () => {
    const session = new SecuritySession(
      sessionUUID,
      userUUID,
      'supabase-session-token',
      'Chrome',
      '127.0.0.1',
      'USA',
      'Desktop',
      'Mozilla/5.0'
    );

    expect(session.revokedByAdmin).toBe(false);
  });

  test('session revocation sets flag and triggers event', () => {
    const session = new SecuritySession(
      sessionUUID,
      userUUID,
      'supabase-session-token',
      'Chrome',
      '127.0.0.1',
      'USA',
      'Desktop',
      'Mozilla/5.0'
    );

    session.revoke();

    expect(session.revokedByAdmin).toBe(true);

    const events = session.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(SessionRevokedEvent);
  });
});
