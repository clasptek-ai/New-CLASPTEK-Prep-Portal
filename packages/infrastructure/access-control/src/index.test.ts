import { describe, test, expect } from 'vitest';
import { JWTParser, AccessControlGuard } from './index';

describe('Access Control Infrastructure Tests', () => {
  // Helper to generate a dummy unsigned JWT token string
  function generateDummyJWT(payload: Record<string, any>): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${body}.signature-placeholder`;
  }

  test('JWTParser parses base64 claims payload', () => {
    const jwt = generateDummyJWT({ sub: 'user-123', permissions: ['identity:profile:read'] });
    const parsed = JWTParser.parse(jwt);

    expect(parsed.sub).toBe('user-123');
    expect(parsed.permissions).toContain('identity:profile:read');
  });

  test('AccessControlGuard verifies context parameters', () => {
    const jwt = generateDummyJWT({ sub: 'user-123', permissions: ['identity:profile:read'] });
    const context = AccessControlGuard.authenticate(jwt);

    expect(context.userId).toBe('user-123');

    // Prohibits access if required permission is missing
    expect(() => AccessControlGuard.authorize(context, 'identity:profile:write')).toThrow(
      'Privilege constraint violation: Missing permission "identity:profile:write"'
    );

    // Allows access if permission matches
    expect(() => AccessControlGuard.authorize(context, 'identity:profile:read')).not.toThrow();
  });
});
