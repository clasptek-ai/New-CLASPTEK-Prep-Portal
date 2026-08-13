export const dynamic = 'force-dynamic';

/**
 * RC1 Phase 5 — Legacy Compatibility Layer
 *
 * These routes are DEPRECATED in favour of the Universal Assessment Engine:
 *   GET  /api/v1/assessment-attempts    (active attempt lookup)
 *   POST /api/v1/assessment-attempts    (create attempt)
 *
 * This compatibility shim proxies legacy callers to the universal engine.
 * It is retained ONLY for backward compatibility with pre-RC1 mobile/web clients.
 *
 * CLASSIFICATION: REDIRECT (not remove, not duplicate logic)
 * Deprecation target: RC2 release.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Redirect to universal engine — active attempt check
  const url = new URL('/api/v1/assessment-attempts', req.url);
  return NextResponse.redirect(url, { status: 308 });
}

export async function POST(req: NextRequest) {
  // Proxy POST body to the universal engine endpoint
  const url = new URL('/api/v1/assessment-attempts', req.url);
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward session cookies for auth
      cookie: req.headers.get('cookie') || '',
      authorization: req.headers.get('authorization') || '',
    },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => ({}));

  // Emit deprecation header so clients know to upgrade
  return NextResponse.json(
    { ...json, _deprecation: 'This endpoint is deprecated. Use POST /api/v1/assessment-attempts' },
    {
      status: response.status,
      headers: {
        'X-Deprecated': 'true',
        'X-Replacement': '/api/v1/assessment-attempts',
        Sunset: 'Sat, 01 Nov 2026 00:00:00 GMT',
      },
    }
  );
}
