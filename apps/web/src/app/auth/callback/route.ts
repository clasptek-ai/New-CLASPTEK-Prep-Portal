export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAppUrl, loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { EmailOtpType } from '@supabase/supabase-js';

/**
 * Auth Callback Route Handler
 * Exchanges Supabase PKCE code or OTP token_hash for active session cookies
 */
export async function GET(req: NextRequest) {
  const appUrl = getAppUrl(process.env);
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const rawNext = requestUrl.searchParams.get('next') || (type === 'recovery' ? '/reset-password' : '/student/welcome');

  // Open Redirect Security Check: Ensure next is a relative path starting with a single '/'
  const isRelativePath =
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.startsWith('/\\') &&
    !rawNext.includes(':');

  const safeNext = isRelativePath ? rawNext : (type === 'recovery' ? '/reset-password' : '/student/welcome');

  const config = loadEnvironment(process.env);
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            });
          });
        } catch {
          // Handled if cookies are immutable
        }
      },
    }
  );

  // 1. Verify OTP token_hash if provided (e.g. Supabase Auth Recovery link)
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) {
        return NextResponse.redirect(`${appUrl}${safeNext}`);
      }
      console.error('verifyOtp error in /auth/callback:', error.message);
    } catch (err) {
      console.error('verifyOtp exception in /auth/callback:', err);
    }
  }

  // 2. Exchange PKCE code for session if code is provided
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${appUrl}${safeNext}`);
      }
      console.error('exchangeCodeForSession error in /auth/callback:', error.message);
    } catch (err) {
      console.error('exchangeCodeForSession exception in /auth/callback:', err);
    }
  }

  // Fallback: If request specifies reset-password or recovery, allow client JS on /reset-password to parse hash/session
  if (type === 'recovery' || safeNext.includes('reset-password')) {
    return NextResponse.redirect(`${appUrl}/reset-password`);
  }

  // Token expired, missing, or invalid
  return NextResponse.redirect(`${appUrl}/reset-password?error=invalid_token`);
}
