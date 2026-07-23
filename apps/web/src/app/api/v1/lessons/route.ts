export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';

export async function GET(req: NextRequest) {
  const { searchLessonsHandler } = await getLearningResourceContext();
  const searchParams = req.nextUrl.searchParams;
  const moduleId = searchParams.get('moduleId') || undefined;

  const lessons = await searchLessonsHandler.execute({ moduleId });
  return NextResponse.json(lessons);
}
