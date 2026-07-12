import { NextResponse } from 'next/server';
import { PrincipalContext } from '@clasptek/authorization';

export async function GET() {
  const mockPrincipal: PrincipalContext = {
    userId: '00000000-0000-0000-0000-000000000000',
    permissions: [
      'identity:profile:read',
      'identity:profile:write',
      'identity:session:read',
      'identity:session:revoke',
    ],
  };
  return NextResponse.json(mockPrincipal);
}
