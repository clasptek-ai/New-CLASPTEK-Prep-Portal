import { NextRequest, NextResponse } from 'next/server';
import { getCurriculumContext } from '@/lib/curriculum-context';

export async function GET(req: NextRequest) {
  const { searchCurriculaHandler, logger } = await getCurriculumContext();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const code = searchParams.get('code') || undefined;
    const examProduct = searchParams.get('examProduct') || undefined;

    const curricula = await searchCurriculaHandler.execute({ status, code, examProduct });
    
    const results = curricula.map(cur => ({
      id: cur.id,
      code: cur.code.value,
      slug: cur.slug,
      name: cur.name,
      description: cur.description,
      status: cur.status,
      currentVersionId: cur.currentVersionId,
      currentVersionNo: cur.currentVersionNo
    }));

    return NextResponse.json(results, { status: 200 });
  } catch (err: unknown) {
    logger.error('GET /api/v1/curricula failure', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
