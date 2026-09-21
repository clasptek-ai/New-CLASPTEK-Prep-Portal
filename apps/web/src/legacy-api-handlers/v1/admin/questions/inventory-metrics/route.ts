export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { ContentNormalizer } from '@/services/admin/content-normalizer';

export async function GET(_req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const result = await ContentNormalizer.getNormalizedContent(pool, { pageSize: 1 });

    return NextResponse.json({
      success: true,
      metrics: result.metrics,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/questions/inventory-metrics error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
