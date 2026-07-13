import { NextRequest, NextResponse } from 'next/server';
import { getIdentityContext } from '@/lib/identity-context';
import { UserId } from '@clasptek/domain-identity';
import { UpdateProfileCommand } from '@clasptek/application-identity';
import { ApplicationError } from '@clasptek/kernel';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { repository, logger } = await getIdentityContext();
  try {
    const { id } = await params;
    const user = await repository.findById(new UserId(id));
    if (!user || !user.profile) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        id: user.profile.id.value,
        userId: user.id.value,
        firstName: user.profile.firstName.value,
        lastName: user.profile.lastName.value,
        avatar: user.profile.avatar,
        locale: user.profile.locale,
        timeZone: user.profile.timeZone,
      },
    });
  } catch (err: unknown) {
    logger.error(
      'GET /api/v1/identity/profiles/[id] failure',
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { updateProfileHandler, logger } = await getIdentityContext();
  try {
    const { id } = await params;
    const body = await req.json();
    const command: UpdateProfileCommand = {
      userId: id,
      firstName: body.firstName,
      lastName: body.lastName,
      avatar: body.avatar,
      locale: body.locale,
      timeZone: body.timeZone,
    };

    await updateProfileHandler.execute(command);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error(
      'PATCH /api/v1/identity/profiles/[id] failure',
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
