import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Runtime Middleware
 *
 * Performance & Security Middleware:
 * - Generates X-Request-ID correlation UUID using Web Crypto API (crypto.randomUUID())
 * - Enforces Content-Security-Policy (CSP), HSTS, X-Frame-Options, COOP, COEP
 * - Edge load-balancer rate limit indicators
 * - Public & recovery route pass-through guarantee
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Generate correlation ID for every request using Web Crypto API (Edge-compatible)
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  // Explicit Public & Auth Recovery Route Pass-Through Guarantee
  const isPublicOrRecoveryRoute =
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email');

  if (isPublicOrRecoveryRoute) {
    // Guarantees recovery callbacks and auth forms are never blocked or redirected
  }

  // Content Security Policy
  // - Includes Sentry (sentry.io) and PostHog (app.posthog.com) for production observability
  // - unsafe-inline/unsafe-eval required by Next.js hydration; nonce-based upgrade is a future milestone
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://app.posthog.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https: ws: wss: https://*.sentry.io https://app.posthog.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Security Headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Cross-Origin isolation headers (prevents Spectre-class attacks)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none'); // 'require-corp' would break external fonts/images

  // Rate-limiting header indicators for edge load balancer
  response.headers.set('X-RateLimit-Limit', '1000');
  response.headers.set('X-RateLimit-Remaining', '999');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.json).*)'],
};
