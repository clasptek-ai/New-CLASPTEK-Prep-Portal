export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getExamContext } from '@/lib/exam-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';

export async function GET(req: NextRequest) {
  const { getSkillHierarchyHandler, logger } = await getExamContext();
  try {
    const { searchParams } = new URL(req.url);
    const frameworkVersionId = searchParams.get('frameworkVersionId');

    if (!frameworkVersionId) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing frameworkVersionId query parameter.' },
        { status: 400 }
      );
    }

    const queryResult = await getSkillHierarchyHandler.execute(frameworkVersionId);
    if (queryResult.isFailure) {
      return NextResponse.json(
        { code: 'QUERY_ERROR', message: queryResult.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(queryResult.value, { status: 200 });
  } catch (err: any) {
    logger.error('GET /api/admin/skills failure', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
