import { NextRequest, NextResponse } from 'next/server';
import { getIdentityContext } from '@/lib/identity-context';
import { UserId } from '@clasptek/domain-identity';
import { ApplicationError } from '@clasptek/kernel';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { repository, logger } = await getIdentityContext();
  try {
    const { id } = await params;
    const user = await repository.findById(new UserId(id));
    if (!user) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id.value,
        status: user.status,
        version: user.version,
        identities: user.identities.map((i) => ({
          id: i.id.value,
          email: i.email.value,
          provider: i.provider,
          isVerified: i.isVerified,
          loginIdentifier: i.loginIdentifier,
        })),
        profile: user.profile
          ? {
              id: user.profile.id.value,
              firstName: user.profile.firstName.value,
              lastName: user.profile.lastName.value,
              avatar: user.profile.avatar,
              locale: user.profile.locale,
              timeZone: user.profile.timeZone,
            }
          : null,
      },
    });
  } catch (err: unknown) {
    logger.error(
      'GET /api/v1/identity/users/[id] failure',
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
