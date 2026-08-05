export const dynamic = 'force-dynamic';

/**
 * RC1 Phase 5 — Legacy Compatibility Layer
 *
 * DEPRECATED: GET /api/v1/diagnostic/attempts/:id
 * REPLACEMENT: GET /api/v1/assessment-attempts/:id
 *
 * CLASSIFICATION: REDIRECT (308 Permanent Redirect)
 * The universal engine reads from paper_snapshot — no re-query of question_bank.
 * Deprecation target: RC2 release.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(`/api/v1/assessment-attempts/${id}`, req.url);
  // Preserve any query string
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, {
    status: 308,
    headers: {
      'X-Deprecated': 'true',
      'X-Replacement': `/api/v1/assessment-attempts/${id}`,
      Sunset: 'Sat, 01 Nov 2026 00:00:00 GMT',
    },
  });
}
