import { NextRequest, NextResponse } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';

export async function GET(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { getLessonHandler } = await getLearningResourceContext();
  const { id } = await _params.params;

  const lesson = await getLessonHandler.execute(id);
  if (!lesson) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Lesson not found' }, { status: 404 });
  }

  // Format content blocks and versions for JSON delivery
  return NextResponse.json({
    id: lesson.id,
    moduleId: lesson.moduleId,
    code: lesson.code.value,
    name: lesson.name,
    description: lesson.description,
    displayOrder: lesson.displayOrder,
    status: lesson.status,
    versions: lesson.versions.map(v => ({
      id: v.id,
      versionNo: v.versionNo.value,
      status: v.status,
      name: v.name,
      description: v.description,
      contentBlocks: v.contentBlocks.map(cb => ({
        id: cb.id,
        blockType: cb.blockType,
        textContent: cb.textContent,
        displayOrder: cb.displayOrder
      }))
    }))
  });
}
