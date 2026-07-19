import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLearningResourceContext } from '@/lib/learning-resource-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';
import { SemanticVersion } from '@clasptek/domain-learning-resources';

export async function PATCH(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { getResourceHandler, resourceRepo, logger } = await getLearningResourceContext();
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
      AccessControlGuard.authorize(principal, 'resource.update' as PermissionCode);
    }

    const { id } = await _params.params;
    const resource = await getResourceHandler.execute(id);
    if (!resource) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Resource not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, name, description, versionNo, key, value } = body;

    if (action === 'createVersion') {
      if (!versionNo || !name) {
        return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing version details' }, { status: 400 });
      }
      resource.createVersion(resourceRepo.nextIdentity(), new SemanticVersion(versionNo), name, description || '');
    } else if (action === 'setMetadata') {
      if (!versionNo || !key || value === undefined) {
        return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing metadata parameters' }, { status: 400 });
      }
      resource.setMetadata(new SemanticVersion(versionNo), key, value);
    } else {
      // Default: Update details
      resource.update(name || resource.name, description !== undefined ? description : resource.description);
    }

    await resourceRepo.save(resource);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error('PATCH /api/v1/admin/resources/[id] failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
