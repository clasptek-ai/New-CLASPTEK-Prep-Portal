import { NextRequest, NextResponse } from 'next/server';
import { getIdentityContext } from '@/lib/identity-context';
import { RestoreUserCommand } from '@clasptek/application-identity';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { restoreUserHandler, logger } = await getIdentityContext();
  try {
    const { id } = await params;
    const command: RestoreUserCommand = {
      userId: id,
    };

    await restoreUserHandler.execute(command);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/identity/users/[id]/restore failure',
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
