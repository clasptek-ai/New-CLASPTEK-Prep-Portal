import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurriculumContext } from '@/lib/curriculum-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { approveCurriculumVersionHandler, logger } = await getCurriculumContext();
  try {
    const resolvedParams = await params;
    const curriculumId = resolvedParams.id;

    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore Next.js request scope errors in unit tests
      }
    }
    if (!token) {
      token = req.headers.get('authorization')?.split(' ')[1] || null;
    }

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'curriculum.update' as PermissionCode);
    }

    const body = await req.json();
    const { versionId, expectedVersion } = body;

    if (!versionId || expectedVersion === undefined) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing versionId or expectedVersion' }, { status: 400 });
    }

    await approveCurriculumVersionHandler.execute({
      curriculumId,
      versionId,
      expectedVersion
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    logger.error('POST /api/v1/admin/curricula/[id]/approve failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
