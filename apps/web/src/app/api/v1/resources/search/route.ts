export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';

export async function GET(req: NextRequest) {
  const { searchResourcesHandler } = await getLearningResourceContext();
  const searchParams = req.nextUrl.searchParams;

  const resourceType = searchParams.get('resourceType') || undefined;
  const categoryCode = searchParams.get('categoryCode') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const language = searchParams.get('language') || undefined;
  const sensitivity = searchParams.get('sensitivity') || undefined;

  const resources = await searchResourcesHandler.execute({
    resourceType,
    categoryCode,
    tag,
    language,
    sensitivity,
  });

  return NextResponse.json(
    resources.map((resource) => ({
      id: resource.resourceId,
      resourceId: resource.resourceId,
      code: resource.code,
      resourceType: resource.resourceType,
      slug: resource.slug,
      name: resource.title,
      title: resource.title,
      description: resource.description,
      status: resource.status,
    }))
  );
}
