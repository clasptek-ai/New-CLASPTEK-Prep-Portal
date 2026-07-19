import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId is required' }, { status: 400 });

    const enrollments = await ctx.getEnrollments.execute({ journeyId });
    return NextResponse.json(enrollments.map(e => ({
      id: e.id,
      programmeId: e.programmeId,
      programmeVersionId: e.programmeVersionId,
      status: e.status,
      deliveryMode: e.deliveryMode,
      cohortId: e.cohortId,
      enrolledAt: e.completedAt,
      paymentVerified: e.paymentVerified,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, programmeId, programmeVersionId, deliveryMode, cohortId, intakeDate } = body;
    if (!journeyId || !programmeId || !programmeVersionId) {
      return NextResponse.json({ error: 'journeyId, programmeId, programmeVersionId are required' }, { status: 400 });
    }

    const id = await ctx.enrolProgramme.execute({
      journeyId, programmeId, programmeVersionId,
      deliveryMode, cohortId,
      intakeDate: intakeDate ? new Date(intakeDate) : undefined,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
