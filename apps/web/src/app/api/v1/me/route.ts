export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrincipalContext } from '@clasptek/domain-authorization';

export async function GET() {
  const mockPrincipal: PrincipalContext = {
    userId: '00000000-0000-0000-0000-000000000000',
    permissions: [
      'identity:profile:read',
      'identity:profile:write',
      'auth:session:read',
      'auth:session:write',
    ],
  };
  return NextResponse.json(mockPrincipal);
}
