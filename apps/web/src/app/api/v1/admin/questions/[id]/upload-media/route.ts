import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';
import { SemanticVersion, QuestionMedia } from '@clasptek/domain-question-bank';

export async function POST(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { getQuestionHandler, questionRepo, logger } = await getQuestionBankContext();
  try {
    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore
      }
    }
    if (!token) {
      token = req.headers.get('authorization')?.split(' ')[1] || null;
    }

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'question.update' as PermissionCode);
    }

    const { id } = await _params.params;
    const question = await getQuestionHandler.execute(id);
    if (!question) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Question not found' }, { status: 404 });
    }

    const body = await req.json();
    const { versionNo, mediaId, provider, bucket, objectKey, checksum, mimeType, fileSize, durationSeconds, transcript, caption, thumbnailKey, altText } = body;

    if (!versionNo || !mediaId || !provider || !bucket || !objectKey || !mimeType || fileSize === undefined) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing media parameters' }, { status: 400 });
    }

    const media = new QuestionMedia(
      mediaId,
      provider,
      bucket,
      objectKey,
      checksum || '',
      mimeType,
      fileSize,
      durationSeconds || null,
      transcript || null,
      caption || null,
      thumbnailKey || null,
      altText || null
    );

    question.addMedia(new SemanticVersion(versionNo), media);
    await questionRepo.save(question);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error('POST /api/v1/admin/questions/[id]/upload-media failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
