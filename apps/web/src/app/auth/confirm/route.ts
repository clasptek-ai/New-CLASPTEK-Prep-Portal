export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAppUrl, loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { EmailOtpType } from '@supabase/supabase-js';

/**
 * Email Confirmation Route Handler — /auth/confirm
 *
 * DEDICATED to signup email confirmation only.
 * This route MUST NOT handle password recovery.
 *
 * Flow:
 *   1. Read token_hash + type from query params
 *   2. Reject if type is 'recovery' (that belongs to /auth/callback)
 *   3. Exchange OTP token for session via Supabase verifyOtp
 *   4. On success: redirect to /login?confirmed=1
 *   5. On failure: redirect to /login?error=confirmation_failed
 *
 * This route NEVER calls:
 *   - resetPasswordForEmail()
 *   - updateUser({ password: ... })
 *   - redirects to /reset-password or /change-password
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

  // SECURITY: If this is a recovery flow, redirect to /auth/callback immediately
  // This route is exclusively for email confirmation.
  if (type === 'recovery') {
    const params = requestUrl.searchParams.toString();
    return NextResponse.redirect(`${appUrl}/auth/callback?${params}`);
  }

  // Handle explicit Supabase Auth Error params (e.g. otp_expired / access_denied)
  if (errorParam || errorCode || errorDesc) {
    const errorQuery = new URLSearchParams();
    errorQuery.set('error', 'confirmation_failed');
    if (errorCode) errorQuery.set('error_code', errorCode);
    if (errorDesc) errorQuery.set('error_description', errorDesc);

    return NextResponse.redirect(`${appUrl}/login?${errorQuery.toString()}`);
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

  const failureRedirectUrl = `${appUrl}/login?error=confirmation_failed&error_code=otp_expired`;

  // 1. Verify OTP token_hash if provided (email confirmation link)
  if (token_hash && type) {
    // Only accept confirmation-related types
    const allowedTypes: EmailOtpType[] = ['signup', 'email_change', 'email'];
    if (!allowedTypes.includes(type)) {
      console.warn(`[AUTH_CONFIRM] Rejected unexpected type="${type}" in /auth/confirm`);
      return NextResponse.redirect(failureRedirectUrl);
    }

    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) {
        console.info(`[AUTH_CONFIRM] Email confirmed successfully via type="${type}"`);
        return NextResponse.redirect(`${appUrl}/login?confirmed=1`);
      }
      console.error(`[AUTH_CONFIRM] verifyOtp error: ${error.message}`);
      return NextResponse.redirect(failureRedirectUrl);
    } catch (err) {
      console.error('[AUTH_CONFIRM] verifyOtp exception:', err);
      return NextResponse.redirect(failureRedirectUrl);
    }
  }

  // 2. Exchange PKCE code for session if code is provided
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        console.info('[AUTH_CONFIRM] Email confirmed successfully via PKCE code exchange');
        return NextResponse.redirect(`${appUrl}/login?confirmed=1`);
      }
      console.error(`[AUTH_CONFIRM] exchangeCodeForSession error: ${error.message}`);
      return NextResponse.redirect(failureRedirectUrl);
    } catch (err) {
      console.error('[AUTH_CONFIRM] exchangeCodeForSession exception:', err);
      return NextResponse.redirect(failureRedirectUrl);
    }
  }

  // No valid token or code — redirect to login with error
  return NextResponse.redirect(failureRedirectUrl);
}
