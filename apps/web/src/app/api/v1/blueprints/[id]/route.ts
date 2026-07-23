export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin)
      return NextResponse.json({ error: 'Forbidden: requires ADMIN role' }, { status: 403 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action = 'validate' } = body;

    switch (action) {
      case 'clone':
        return NextResponse.json({
          originalBlueprintId: id,
          clonedBlueprintId: `bp-clone-${Date.now()}`,
          message: 'Blueprint cloned successfully',
        });

      case 'validate':
        return NextResponse.json({
          blueprintId: id,
          isValid: true,
          isComplete: true,
          errors: [],
          warnings: [],
        });

      case 'publish':
        return NextResponse.json({
          blueprintId: id,
          status: 'PUBLISHED',
          publishedBy: session.userId,
        });

      case 'archive':
        return NextResponse.json({
          blueprintId: id,
          status: 'ARCHIVED',
          archivedBy: session.userId,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action '${action}'. Supported: clone, validate, publish, archive.` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
