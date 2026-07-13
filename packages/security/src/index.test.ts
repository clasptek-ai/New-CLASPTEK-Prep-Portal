import { describe, test, expect } from 'vitest';
import { buildCSPHeader, getSecureHeaders, generateCryptoHash, verifyCryptoHash } from './index';

describe('Security Package Unit Tests', () => {
  test('buildCSPHeader joins directives correctly', () => {
    const csp = buildCSPHeader({
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'unsafe-inline'"],
      'img-src': [],
      'connect-src': [],
      'frame-ancestors': [],
    });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("style-src 'unsafe-inline'");
  });

  test('getSecureHeaders returns standard baseline parameters', () => {
    const headers = getSecureHeaders();
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  test('verifyCryptoHash validates correct payload signature', () => {
    const secret = 'super-secret-key-123';
    const data = 'user-profile-session-data';
    const hash = generateCryptoHash(data, secret);

    expect(verifyCryptoHash(data, hash, secret)).toBe(true);
    expect(verifyCryptoHash('tampered-data', hash, secret)).toBe(false);
  });
});
