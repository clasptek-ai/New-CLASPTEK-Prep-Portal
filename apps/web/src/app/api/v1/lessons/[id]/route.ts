import { NextRequest, NextResponse } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';

export async function GET(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { lessonRepo } = await getLearningResourceContext();
  const { id } = await _params.params;

  const lesson = await lessonRepo.findById(id);
  if (!lesson) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Lesson not found' }, { status: 404 });
  }

  // Format content blocks and versions for JSON delivery
  return NextResponse.json({
    id: lesson.id,
    moduleId: lesson.moduleId || (lesson as any).learningModuleId,
    code: typeof lesson.code === 'string' ? lesson.code : (lesson as any).code?.value,
    name: lesson.name || (lesson as any).title,
    description: lesson.description || (lesson as any).summary,
    displayOrder: lesson.displayOrder || (lesson as any).defaultSequenceNo,
    status: lesson.status,
    versions: (lesson.versions || []).map((v: any) => ({
      id: v.id,
      versionNo: typeof v.versionNo === 'string' ? v.versionNo : v.versionNo?.value,
      status: v.status,
      name: v.name,
      description: v.description,
      contentBlocks: (v.contentBlocks || []).map((cb: any) => ({
        id: cb.id,
        blockType: cb.blockType,
        textContent: cb.textContent,
        displayOrder: cb.displayOrder
      }))
    }))
  });
}
