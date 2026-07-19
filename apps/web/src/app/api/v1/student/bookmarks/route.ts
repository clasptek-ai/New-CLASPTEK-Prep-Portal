import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import type { BookmarkResourceType } from '@clasptek/domain-student-learning';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    const journey = await ctx.getJourney.execute({ journeyId });
    if (!journey) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });

    return NextResponse.json(journey.bookmarks.map(b => ({
      id: b.id,
      resourceType: b.resourceType,
      resourceId: b.resourceId,
      notes: b.notes,
      createdAt: b.createdAt,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, resourceType, resourceId, notes } = body;
    if (!journeyId || !resourceType || !resourceId) {
      return NextResponse.json({ error: 'journeyId, resourceType, resourceId required' }, { status: 400 });
    }

    const id = await ctx.bookmarkResource.execute({
      journeyId,
      resourceType: resourceType as BookmarkResourceType,
      resourceId,
      notes,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
