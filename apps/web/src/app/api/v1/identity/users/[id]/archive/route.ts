import { NextRequest, NextResponse } from 'next/server';
import { getIdentityContext } from '@/lib/identity-context';
import { ArchiveUserCommand } from '@clasptek/application-identity';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { archiveUserHandler, logger } = await getIdentityContext();
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const actorId = body.actorId || '00000000-0000-0000-0000-000000000001';

    const command: ArchiveUserCommand = {
      userId: id,
      actorId,
    };

    await archiveUserHandler.execute(command);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/identity/users/[id]/archive failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
