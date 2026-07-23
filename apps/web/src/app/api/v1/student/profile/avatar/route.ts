export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getAuthContext } from '@/lib/auth-context';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatarUrl } = await req.json();
    const { dbPool } = await getAuthContext();
    const pool = dbPool.getPool();

    await pool.query(
      'UPDATE public.profiles SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [avatarUrl, session.userId]
    );

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
