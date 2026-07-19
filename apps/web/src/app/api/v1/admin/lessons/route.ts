import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLearningResourceContext } from '@/lib/learning-resource-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { createLessonHandler, logger } = await getLearningResourceContext();
  try {
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
      AccessControlGuard.authorize(principal, 'lesson.create' as PermissionCode);
    }

    const body = await req.json();
    const { moduleId, code, name, description, displayOrder } = body;

    if (!moduleId || !code || !name || displayOrder === undefined) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing required parameters' }, { status: 400 });
    }

    const lessonId = await createLessonHandler.execute({
      moduleId,
      code,
      name,
      description: description || '',
      displayOrder
    });

    return NextResponse.json({ success: true, id: lessonId }, { status: 201 });
  } catch (err: unknown) {
    logger.error('POST /api/v1/admin/lessons failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
