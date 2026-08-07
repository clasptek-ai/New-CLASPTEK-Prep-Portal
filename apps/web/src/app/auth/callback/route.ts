export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAppUrl, loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { EmailOtpType } from '@supabase/supabase-js';

/**
 * Auth Callback Route Handler
 * Exchanges Supabase PKCE code or OTP token_hash for active session cookies.
 * Guarantees recovery flows always land on /reset-password and never fall back to homepage.
 */
export async function GET(req: NextRequest) {
  const appUrl = getAppUrl(process.env);
  const requestUrl = new URL(req.url);

  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const errorParam = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDesc = requestUrl.searchParams.get('error_description');

  const rawNext =
    requestUrl.searchParams.get('next') ||
    (type === 'recovery' ? '/reset-password' : '/student/welcome');

  // Open Redirect Security Check: Ensure next is a relative path starting with a single '/'
  const isRelativePath =
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.startsWith('/\\') &&
    !rawNext.includes(':');

  const safeNext = isRelativePath
    ? rawNext
    : type === 'recovery'
      ? '/reset-password'
      : '/student/welcome';

  // Handle explicit Supabase Auth Error params (e.g. otp_expired / access_denied)
  if (errorParam || errorCode || errorDesc) {
    const errorQuery = new URLSearchParams();
    errorQuery.set('error', 'invalid_token');
    if (errorCode) errorQuery.set('error_code', errorCode);
    if (errorDesc) errorQuery.set('error_description', errorDesc);

    return NextResponse.redirect(`${appUrl}/reset-password?${errorQuery.toString()}`);
  }

  const config = loadEnvironment(process.env);
  let cookieStore: any;
  try {
    cookieStore = await cookies();
  } catch {
    cookieStore = {
      getAll() {
        return [];
      },
      set() {},
    };
  }

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

  const isRecoveryFlow = type === 'recovery' || safeNext.includes('reset-password');
  const failureRedirectUrl = isRecoveryFlow
    ? `${appUrl}/reset-password?error=invalid_token&error_code=otp_expired`
    : `${appUrl}/login?error=invalid_token&error_code=otp_expired`;

  // 1. Verify OTP token_hash if provided (e.g. Supabase Auth Recovery or Confirmation link)
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) {
        return NextResponse.redirect(`${appUrl}${safeNext}`);
      }
      console.error('verifyOtp error in /auth/callback:', error.message);
      return NextResponse.redirect(failureRedirectUrl);
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
      return NextResponse.redirect(failureRedirectUrl);
    } catch (err) {
      console.error('exchangeCodeForSession exception in /auth/callback:', err);
    }
  }

  // Token expired, missing, or invalid -> redirect contextually
  return NextResponse.redirect(failureRedirectUrl);
}
