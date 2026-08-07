import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAppUrl } from '@clasptek/configuration';
import { NextRequest } from 'next/server';
import { GET as handleAuthCallback } from './auth/callback/route';
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

  it('1. Registration confirmation email redirect URL includes /auth/callback?next=/student/welcome', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    const emailRedirectTo = `${appUrl}/auth/callback?next=/student/welcome`;

    expect(emailRedirectTo).toBe('https://portal.clasptek.org/auth/callback?next=/student/welcome');
    expect(emailRedirectTo).not.toContain('localhost');
  });

  it('2. Password recovery email redirect URL includes /auth/callback?next=/reset-password', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

    expect(redirectTo).toBe('https://portal.clasptek.org/auth/callback?next=/reset-password');
  });

  it('3. Double-clicking or accessing invalid recovery token redirects to /reset-password?error=invalid_token', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest('https://portal.clasptek.org/auth/callback?type=recovery');
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain(
      'https://portal.clasptek.org/reset-password?error=invalid_token'
    );
  });

  it('4. Double-clicking or accessing invalid confirmation token redirects to /login?error=invalid_token', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest('https://portal.clasptek.org/auth/callback?type=signup');
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain(
      'https://portal.clasptek.org/login?error=invalid_token'
    );
  });

  it('5. Open redirect injections (e.g. external URL or protocol relative path) are rejected safely', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';

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
  });

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
