import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession, AuthenticatedSession } from './auth-util';

export const ALLOWED_ADMIN_ROLES = [
  'ADMIN',
  'ADMINISTRATOR',
  'SUPER_ADMIN',
  'SUPER_ADMINISTRATOR',
  'STAFF',
];

export async function requireAdminSession(
  req: NextRequest
): Promise<
  | { session: AuthenticatedSession; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getAuthenticatedSession(req);
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Unauthorized. Authentication session required.' },
        { status: 401 }
      ),
    };
  }

  const hasAdminRole = session.roles.some((role) =>
    ALLOWED_ADMIN_ROLES.includes(role.toUpperCase())
  );

  if (!hasAdminRole) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Unauthorized. Admin role credentials required.' },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
