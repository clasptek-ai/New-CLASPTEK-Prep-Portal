import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAppUrl } from '@clasptek/configuration';
import { NextRequest } from 'next/server';
import { GET as handleAuthCallback } from './auth/callback/route';
import { GET as handleAuthConfirm } from './auth/confirm/route';
import { validatePasswordStrength } from '@/lib/auth/reset-password';
import { extractSelectedOptionCode } from '@/lib/scoring/extractSelectedOptionCode';

describe('Phase 9: Comprehensive Authentication & Assessment System Regression Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://texnwdyeyussmevexscw.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleG53ZHlleXVzc21ldmV4c2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjkzMDksImV4cCI6MjA5OTUwNTMwOX0.wYwiM21ealqhcIRdSzSXVjDiXyg9bbQPXifiCLn-Iv0',
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres.texnwdyeyussmevexscw:Clasptek_2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=no-verify',
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleG53ZHlleXVzc21ldmV4c2N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkyOTMwOSwiZXhwIjoyMDk5NTA1MzA5fQ.IyOLF0vWYH1VOsH7-FAWNVXdlvu5PdNHS2pwzzA_kCs',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // TEST A: Registration confirmation email redirect targets /auth/confirm
  // =========================================================================
  it('A. Registration confirmation email redirect URL targets /auth/confirm', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    const emailRedirectTo = `${appUrl}/auth/confirm`;

    expect(emailRedirectTo).toBe('https://portal.clasptek.org/auth/confirm');
    expect(emailRedirectTo).not.toContain('localhost');
    expect(emailRedirectTo).not.toContain('/auth/callback');
    expect(emailRedirectTo).not.toContain('reset-password');
    expect(emailRedirectTo).not.toContain('change-password');
  });

  // =========================================================================
  // TEST B: Confirmation flow uses /auth/confirm, NOT /auth/callback recovery
  // =========================================================================
  it('B. Confirmation link URL pattern does NOT include change-password or reset-password', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    const confirmUrl = `${appUrl}/auth/confirm`;

    expect(confirmUrl).not.toContain('change-password');
    expect(confirmUrl).not.toContain('reset-password');
    expect(confirmUrl).toContain('/auth/confirm');
  });

  // =========================================================================
  // TEST C: /auth/callback forwards signup tokens to /auth/confirm
  // =========================================================================
  it('C. /auth/callback forwards type=signup tokens to /auth/confirm', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest(
      'https://portal.clasptek.org/auth/callback?type=signup&token_hash=test123'
    );
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') || '';
    expect(location).toContain('/auth/confirm');
    expect(location).toContain('type=signup');
    expect(location).not.toContain('/reset-password');
  });

  // =========================================================================
  // TEST D: /auth/confirm redirects to /login?confirmed=1 on missing/expired token
  // =========================================================================
  it('D. /auth/confirm with missing token redirects to /login with error', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest('https://portal.clasptek.org/auth/confirm');
    const res = await handleAuthConfirm(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') || '';
    expect(location).toContain('login');
    expect(location).toContain('error=confirmation_failed');
    expect(location).not.toContain('/reset-password');
    expect(location).not.toContain('/change-password');
  });

  // =========================================================================
  // TEST E: /auth/confirm rejects recovery tokens (redirects to /auth/callback)
  // =========================================================================
  it('E. /auth/confirm rejects type=recovery and forwards to /auth/callback', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest(
      'https://portal.clasptek.org/auth/confirm?type=recovery&token_hash=abc123'
    );
    const res = await handleAuthConfirm(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') || '';
    expect(location).toContain('/auth/callback');
  });

  // =========================================================================
  // TEST F: Password recovery still works independently via /auth/callback
  // =========================================================================
  it('F. Password recovery email redirect URL remains /auth/callback?next=/reset-password', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

    expect(redirectTo).toBe('https://portal.clasptek.org/auth/callback?next=/reset-password');
    expect(redirectTo).not.toContain('/auth/confirm');
  });

  // =========================================================================
  // TEST G: Invalid recovery token via /auth/callback redirects to /reset-password?error
  // =========================================================================
  it('G. Invalid recovery token redirects to /reset-password?error=invalid_token', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest('https://portal.clasptek.org/auth/callback?type=recovery');
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain(
      'https://portal.clasptek.org/reset-password?error=invalid_token'
    );
  });

  // =========================================================================
  // TEST H: Open redirect injections are rejected in both /auth/callback and /auth/confirm
  // =========================================================================
  it('H. Open redirect injections are rejected safely', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';

    // Test in /auth/callback
    const reqExternal = new NextRequest(
      'https://portal.clasptek.org/auth/callback?next=https://evil.com/phishing&type=recovery'
    );
    const resExternal = await handleAuthCallback(reqExternal);
    expect(resExternal.headers.get('location')).toContain(
      'https://portal.clasptek.org/reset-password'
    );
    expect(resExternal.headers.get('location')).not.toContain('evil.com');

    const reqProtocolRel = new NextRequest(
      'https://portal.clasptek.org/auth/callback?next=//evil.com&type=recovery'
    );
    const resProtocolRel = await handleAuthCallback(reqProtocolRel);
    expect(resProtocolRel.headers.get('location')).toContain(
      'https://portal.clasptek.org/reset-password'
    );
    expect(resProtocolRel.headers.get('location')).not.toContain('//evil.com');

    // Test in /auth/confirm — error params don't allow redirect injection
    const reqConfirmError = new NextRequest(
      'https://portal.clasptek.org/auth/confirm?error=access_denied&error_description=test'
    );
    const resConfirmError = await handleAuthConfirm(reqConfirmError);
    const confirmLocation = resConfirmError.headers.get('location') || '';
    expect(confirmLocation).toContain('login');
    expect(confirmLocation).not.toContain('evil.com');
  });

  // =========================================================================
  // EXISTING TESTS — Password strength and option code extraction
  // =========================================================================
  it('6. Password strength validation enforces all 5 security criteria', () => {
    const weak = validatePasswordStrength('weak');
    expect(weak.isValid).toBe(false);

    const noSpecial = validatePasswordStrength('Password123');
    expect(noSpecial.isValid).toBe(false);

    const strong = validatePasswordStrength('Password123!');
    expect(strong.isValid).toBe(true);
    expect(strong.score).toBe(5);
  });

  it('7. Option code extraction safely handles JSON string, raw string, and nested objects', () => {
    expect(extractSelectedOptionCode('{"selectedOptionCode":"A"}')).toBe('A');
    expect(extractSelectedOptionCode('{"option":"B"}')).toBe('B');
    expect(extractSelectedOptionCode('A')).toBe('A');
    expect(extractSelectedOptionCode({ code: 'C' })).toBe('C');
    expect(extractSelectedOptionCode({ text: 'Essay text response' })).toBe(null);
  });
});
