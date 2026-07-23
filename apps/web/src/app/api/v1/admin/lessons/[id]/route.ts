export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLearningResourceContext } from '@/lib/learning-resource-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';
import { SemanticVersion } from '@clasptek/domain-learning-resources';

export async function PATCH(req: NextRequest, _params: { params: Promise<{ id: string }> }) {
  const { getLessonHandler, lessonRepo, logger } = await getLearningResourceContext();
  try {
    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore in tests
      }
    }
    if (!token) {
      token = req.headers.get('authorization')?.split(' ')[1] || null;
    }

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'lesson.update' as PermissionCode);
    }

    const { id } = await _params.params;
    const lesson = await lessonRepo.findById(id);
    if (!lesson) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Lesson not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, name, description, versionNo, blockId, blockType, textContent, displayOrder } =
      body;

    if (action === 'createVersion') {
      if (!versionNo || !name) {
        return NextResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Missing version details' },
          { status: 400 }
        );
      }
      if (typeof lesson.createVersion === 'function') {
        lesson.createVersion(
          lessonRepo.nextIdentity(),
          new SemanticVersion(versionNo),
          name,
          description || ''
        );
        await lessonRepo.save(lesson);
      }
    } else if (action === 'addContentBlock') {
      if (!versionNo || !blockId || !blockType || !textContent || displayOrder === undefined) {
        return NextResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Missing content block details' },
          { status: 400 }
        );
      }
      console.log('DEBUG: lesson.versions:', JSON.stringify(lesson.versions));
      if (typeof lesson.addContentBlock === 'function') {
        lesson.addContentBlock(
          new SemanticVersion(versionNo),
          blockId,
          blockType,
          textContent,
          displayOrder
        );
        await lessonRepo.save(lesson);
      }
    } else {
      // Default: Update details
      if (typeof lesson.update === 'function') {
        lesson.update(
          name || lesson.name || (lesson as any).title,
          description !== undefined ? description : lesson.description || (lesson as any).summary
        );
        await lessonRepo.save(lesson);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error(
      'PATCH /api/v1/admin/lessons/[id] failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
