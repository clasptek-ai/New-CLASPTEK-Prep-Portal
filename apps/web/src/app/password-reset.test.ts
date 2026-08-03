import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAppUrl } from '@clasptek/configuration';
import { NextRequest } from 'next/server';
import { GET as handleAuthCallback } from './auth/callback/route';

describe('Password Reset & Auth Callback Verification', () => {
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

  it('1. Production reset request resolves canonical portal.clasptek.org app URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    expect(appUrl).toBe('https://portal.clasptek.org');

    const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;
    expect(redirectTo).toBe('https://portal.clasptek.org/auth/callback?next=/reset-password');
  });

  it('2. Production callback URL NEVER contains localhost or 127.0.0.1', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const appUrl = getAppUrl(process.env);
    const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

    expect(redirectTo).not.toContain('localhost');
    expect(redirectTo).not.toContain('127.0.0.1');
    expect(redirectTo).not.toContain('http://');
    expect(redirectTo.startsWith('https://portal.clasptek.org')).toBe(true);
  });

  it('3. Local development resolves localhost:3000 when no production URL is configured', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.APP_URL;
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    delete process.env.VERCEL_URL;

    const devAppUrl = getAppUrl(process.env);
    expect(devAppUrl).toBe('http://localhost:3000');
  });

  it('4 & 5. Missing or invalid PKCE recovery code redirects to /reset-password?error=invalid_token', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';
    const req = new NextRequest('https://portal.clasptek.org/auth/callback');
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307); // NextResponse.redirect status
    const location = res.headers.get('location');
    expect(location).toContain('https://portal.clasptek.org/reset-password?error=invalid_token');
  });

  it('6. Resolves Vercel preview deployment URL when VERCEL_URL is set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = 'clasptek-portal-git-feature-preview.vercel.app';

    const previewUrl = getAppUrl(process.env);
    expect(previewUrl).toBe('https://clasptek-portal-git-feature-preview.vercel.app');
  });

  it('7. Rejects open redirect parameter injections (e.g. external URL or protocol relative path)', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://portal.clasptek.org';

    // Attempt open redirect via external domain
    const reqExternal = new NextRequest(
      'https://portal.clasptek.org/auth/callback?next=https://evil.com/phishing'
    );
    const resExternal = await handleAuthCallback(reqExternal);
    expect(resExternal.headers.get('location')).toContain(
      'https://portal.clasptek.org/reset-password?error=invalid_token'
    );

    // Attempt open redirect via protocol-relative path '//evil.com'
    const reqProtocolRel = new NextRequest(
      'https://portal.clasptek.org/auth/callback?next=//evil.com'
    );
    const resProtocolRel = await handleAuthCallback(reqProtocolRel);
    expect(resProtocolRel.headers.get('location')).toContain(
      'https://portal.clasptek.org/reset-password?error=invalid_token'
    );
  });
});
