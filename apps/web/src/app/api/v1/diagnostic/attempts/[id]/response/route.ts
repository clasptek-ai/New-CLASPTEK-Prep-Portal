export const dynamic = 'force-dynamic';

/**
 * RC1 Phase 5 — Legacy Compatibility Layer
 *
 * DEPRECATED: PUT /api/v1/diagnostic/attempts/:id/response
 * REPLACEMENT: PATCH /api/v1/assessment-attempts/:id/answers
 *
 * CLASSIFICATION: REDIRECT (308 Permanent Redirect)
 * Deprecation target: RC2 release.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(`/api/v1/assessment-attempts/${id}/answers`, req.url);
  return NextResponse.redirect(url, {
    status: 308,
    headers: {
      'X-Deprecated': 'true',
      'X-Replacement': `/api/v1/assessment-attempts/${id}/answers`,
      Sunset: 'Sat, 01 Nov 2026 00:00:00 GMT',
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(req, { params });
}
