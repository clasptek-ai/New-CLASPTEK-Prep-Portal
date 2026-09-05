import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleAuthConfirm } from './auth/confirm/route';
import { GET as handleAuthCallback } from './auth/callback/route';

const mockVerifyOtp = vi.fn();
const mockExchangeCodeForSession = vi.fn();

vi.mock('@clasptek/persistence', () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      verifyOtp: mockVerifyOtp,
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

describe('Auth Confirmation Redirect — Homepage & Flow Isolation Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_URL: 'https://portal.clasptek.org',
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
  // TEST A: signup token -> /auth/confirm -> successful verification -> final redirect = /
  // =========================================================================
  it('TEST A: signup token -> /auth/confirm -> successful verification -> final redirect = /', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: null });

    const req = new NextRequest(
      'https://portal.clasptek.org/auth/confirm?token_hash=valid_signup_token&type=signup'
    );
    const res = await handleAuthConfirm(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe('https://portal.clasptek.org/');
    expect(location).not.toContain('/login');
    expect(location).not.toContain('/reset-password');
    expect(location).not.toContain('confirmed=1');
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: 'valid_signup_token',
      type: 'signup',
    });
  });

  it('TEST A (PKCE code exchange): PKCE code -> /auth/confirm -> successful code exchange -> final redirect = /', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });

    const req = new NextRequest('https://portal.clasptek.org/auth/confirm?code=valid_pkce_code');
    const res = await handleAuthConfirm(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe('https://portal.clasptek.org/');
    expect(location).not.toContain('/login');
    expect(location).not.toContain('/reset-password');
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid_pkce_code');
  });

  // =========================================================================
  // TEST B: recovery token -> password recovery flow -> final destination = /reset-password
  // =========================================================================
  it('TEST B: recovery token -> password recovery flow -> final destination = /reset-password', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: null });

    const req = new NextRequest(
      'https://portal.clasptek.org/auth/callback?token_hash=valid_recovery_token&type=recovery'
    );
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe('https://portal.clasptek.org/reset-password');
    expect(location).not.toBe('https://portal.clasptek.org/');
    expect(location).not.toContain('/auth/confirm');
  });

  // =========================================================================
  // TEST C: signup token cannot enter password-reset flow
  // =========================================================================
  it('TEST C: signup token cannot enter password-reset flow', async () => {
    const req = new NextRequest(
      'https://portal.clasptek.org/auth/callback?token_hash=signup_token_123&type=signup'
    );
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') || '';
    expect(location).toContain('/auth/confirm');
    expect(location).toContain('type=signup');
    expect(location).not.toContain('/reset-password');
  });

  // =========================================================================
  // TEST D: recovery token cannot enter signup-confirmation flow
  // =========================================================================
  it('TEST D: recovery token cannot enter signup-confirmation flow', async () => {
    const req = new NextRequest(
      'https://portal.clasptek.org/auth/confirm?token_hash=recovery_token_123&type=recovery'
    );
    const res = await handleAuthConfirm(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') || '';
    expect(location).toContain('/auth/callback');
    expect(location).toContain('type=recovery');
    expect(location).not.toBe('https://portal.clasptek.org/');
  });

  // =========================================================================
  // TEST E: Preserves failure handling: invalid/expired confirmation token redirects to /login?error=confirmation_failed
  // =========================================================================
  it('Preserves failure handling: invalid/expired confirmation token redirects to /login?error=confirmation_failed', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: new Error('Token expired') });

    const req = new NextRequest(
      'https://portal.clasptek.org/auth/confirm?token_hash=expired_token&type=signup'
    );
    const res = await handleAuthConfirm(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') || '';
    expect(location).toContain('/login');
    expect(location).toContain('error=confirmation_failed');
    expect(location).not.toBe('https://portal.clasptek.org/');
  });
});
