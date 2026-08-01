export const dynamic = 'force-dynamic';

/**
 * RC1 Phase 5 — Legacy Compatibility Layer
 *
 * DEPRECATED: POST /api/v1/diagnostic/attempts/:id/placement
 * REPLACEMENT: The scoring engine in POST /api/v1/assessment-attempts/:id/submit
 *              now computes placement inline and stores it in scoreBreakdown.
 *              Future dedicated placement endpoint: GET /api/v1/assessment-attempts/:id/result
 *
 * CLASSIFICATION: DEPRECATED — returns 410 Gone with migration guidance
 * Deprecation target: Remove in RC2.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return NextResponse.json(
    {
      success: false,
      error: 'ENDPOINT_DEPRECATED',
      message:
        'POST /api/v1/diagnostic/attempts/:id/placement is deprecated in RC1. ' +
        'Placement is now computed inline during submission. ' +
        'Use GET /api/v1/assessment-attempts/:id to retrieve placement results after submission.',
      replacement: `/api/v1/assessment-attempts/${id}`,
      sunset: '2026-11-01',
    },
    {
      status: 410,
      headers: {
        'X-Deprecated': 'true',
        'X-Replacement': `/api/v1/assessment-attempts/${id}`,
        'Sunset': 'Sat, 01 Nov 2026 00:00:00 GMT',
      },
    }
  );
}
