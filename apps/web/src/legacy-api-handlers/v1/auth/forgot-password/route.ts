export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { loadEnvironment, getAppUrl } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { getRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { getOrCreateRequestId } from '@/lib/correlation';

/**
 * POST /api/v1/auth/forgot-password
 *
 * Hardened Password Reset Email Trigger:
 * - Rate limited: max 3 requests per 60 minutes per IP/email
 * - Request correlation ID attached
 * - Structured logger records request lifecycle
 * - Non-enumerating response: returns 200 OK regardless of whether email exists
 */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req.headers);
  const clientIp = getClientIp(req.headers);

  try {
    // 1. Rate Limiting Check
    const rateLimiter = getRateLimiter('forgot-password');
    const rateCheck = rateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
      logger.warn('[FORGOT_PASSWORD] Rate limit exceeded', { requestId, clientIp });
      return ApiResponse.rateLimited(requestId);
    }

    const body = await req.json().catch(() => null);
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || !email.includes('@')) {
      return ApiResponse.validationError(
        [{ field: 'email', message: 'A valid email address is required.' }],
        requestId
      );
    }

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
              cookieStore.set(name, value, options);
            });
          } catch {
            // Handled if cookies are immutable
          }
        },
      }
    );

    const appUrl = getAppUrl(process.env);
    const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

    logger.auth('PASSWORD_RESET_REQUEST', { requestId, email, clientIp, redirectTo });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      logger.error('[FORGOT_PASSWORD] Supabase resetPasswordForEmail error', error, {
        requestId,
        email,
      });
      // Security: Do not expose specific Supabase auth error to prevent account enumeration
    } else {
      logger.info('[FORGOT_PASSWORD] Recovery email dispatched successfully', { requestId, email });
    }

    // Always return success to prevent email enumeration attacks
    return ApiResponse.success(
      {
        message: 'If an account exists for this email, password reset instructions have been sent.',
      },
      { requestId }
    );
  } catch (err: unknown) {
    logger.error('[FORGOT_PASSWORD_EXCEPTION]', err, { requestId });
    return ApiResponse.internalError(requestId, err instanceof Error ? err.message : String(err));
  }
}
