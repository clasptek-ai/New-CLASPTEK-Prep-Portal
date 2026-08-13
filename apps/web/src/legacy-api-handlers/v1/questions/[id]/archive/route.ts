export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getQuestionBankContext } from '@/lib/question-bank-context';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin)
      return NextResponse.json({ error: 'Forbidden: requires ADMIN role' }, { status: 403 });

    const { id } = await params;
    const ctx = await getQuestionBankContext();
    await ctx.archiveQuestionHandler.execute({ questionId: id, archivedBy: session.userId });

    return NextResponse.json({
      success: true,
      questionId: id,
      status: 'ARCHIVED',
      archivedBy: session.userId,
      message: `Question '${id}' has been archived.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
