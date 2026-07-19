import { NextRequest, NextResponse } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';

export async function GET(req: NextRequest) {
  const { searchResourcesHandler } = await getLearningResourceContext();
  const searchParams = req.nextUrl.searchParams;

  const lessonId = searchParams.get('lessonId') || undefined;
  const resourceType = searchParams.get('resourceType') || undefined;
  const tagsCsv = searchParams.get('tags') || '';
  const tags = tagsCsv ? tagsCsv.split(',') : undefined;
  const language = searchParams.get('language') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;

  const resources = await searchResourcesHandler.execute({
    lessonId,
    resourceType,
    tags,
    language,
    difficulty
  });

  return NextResponse.json(
    resources.map(resource => ({
      id: resource.id,
      lessonId: resource.lessonId,
      code: resource.code.value,
      resourceType: resource.resourceType,
      slug: resource.slug,
      name: resource.name,
      description: resource.description,
      displayOrder: resource.displayOrder,
      status: resource.status
    }))
  );
}
