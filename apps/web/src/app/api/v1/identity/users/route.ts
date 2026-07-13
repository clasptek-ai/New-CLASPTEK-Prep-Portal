import { NextRequest, NextResponse } from 'next/server';
import { getIdentityContext } from '@/lib/identity-context';
import { CreateUserCommand } from '@clasptek/application-identity';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { createUserHandler, logger } = await getIdentityContext();
  try {
    const body = await req.json();
    const command: CreateUserCommand = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      provider: body.provider || 'LOCAL',
      loginIdentifier: body.loginIdentifier || body.email,
    };

    const userId = await createUserHandler.execute(command);
    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/identity/users failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: err.code === 'CONFLICT' ? 409 : 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { dbPool, logger } = await getIdentityContext();
  try {
    const pool = dbPool.getPool();
    const res = await pool.query(`
      SELECT u.id, u.status, u.version, i.email, i.provider, p.first_name, p.last_name
      FROM users u
      LEFT JOIN identities i ON u.id = i.user_id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.deleted_at IS NULL
    `);
    return NextResponse.json({ users: res.rows });
  } catch (err: unknown) {
    logger.error(
      'GET /api/v1/identity/users failure',
      err instanceof Error ? err : new Error(String(err))
    );
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
