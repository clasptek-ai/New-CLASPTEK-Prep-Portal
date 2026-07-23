export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLearningResourceContext } from '@/lib/learning-resource-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { createResourceHandler, logger } = await getLearningResourceContext();
  try {
    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore in tests
      }
    }
    if (!token) {
      token = req.headers.get('authorization')?.split(' ')[1] || null;
    }

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'resource.create' as PermissionCode);
    }

    const body = await req.json();
    const { code, resourceType, slug, name, title, description } = body;

    const resourceTitle = name || title;
    if (!code || !resourceType || !slug || !resourceTitle) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const resourceId = crypto.randomUUID();
    await createResourceHandler.execute({
      id: resourceId,
      code,
      slug,
      title: resourceTitle,
      description: description || '',
      resourceTypeId: resourceType,
    });

    return NextResponse.json({ success: true, id: resourceId }, { status: 201 });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/admin/resources failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
