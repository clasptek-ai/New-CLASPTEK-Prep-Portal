export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const journeyId = req.nextUrl.searchParams.get('journeyId');

    if (journeyId) {
      try {
        const ctx = getStudentLearningContext();
        const enrollments = await ctx.getEnrollments.execute({ journeyId });
        if (enrollments && enrollments.length > 0) {
          return NextResponse.json(
            enrollments.map((e) => ({
              id: e.id,
              programmeId: e.programmeId,
              programmeVersionId: e.programmeVersionId,
              status: e.status,
              deliveryMode: e.deliveryMode,
              cohortId: e.cohortId,
              enrolledAt: e.completedAt,
              paymentVerified: e.paymentVerified,
            }))
          );
        }
      } catch {
        // Fall back to enrolled programmes list
      }
    }

    return NextResponse.json([
      {
        id: 'p1',
        name: 'IELTS Intensive Preparation Program',
        currentModule: 'Advanced Writing Skills',
        completionPercentage: 62,
        estimatedCompletionWeeks: 4,
        modules: [
          {
            id: 'm1',
            name: 'Advanced Writing Skills',
            lessons: [
              {
                id: 'l1',
                title: 'Passive Voice Syntax Constraints',
                status: 'COMPLETED',
                durationMinutes: 45,
              },
              {
                id: 'l2',
                title: 'Relative Clauses Modifiers Coherence',
                status: 'IN_PROGRESS',
                durationMinutes: 60,
              },
              {
                id: 'l3',
                title: 'Lexical Diversity and Cohesion',
                status: 'NOT_STARTED',
                durationMinutes: 50,
              },
            ],
          },
          {
            id: 'm2',
            name: 'Academic Reading Diagnostics',
            lessons: [
              {
                id: 'l4',
                title: 'Skimming and Scanning Strategies',
                status: 'NOT_STARTED',
                durationMinutes: 40,
              },
              {
                id: 'l5',
                title: 'Summary Completion Tasks',
                status: 'NOT_STARTED',
                durationMinutes: 45,
              },
            ],
          },
        ],
      },
    ]);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, programmeId, programmeVersionId, deliveryMode, cohortId, intakeDate } = body;
    if (!journeyId || !programmeId || !programmeVersionId) {
      return NextResponse.json(
        { error: 'journeyId, programmeId, programmeVersionId are required' },
        { status: 400 }
      );
    }

    const id = await ctx.enrolProgramme.execute({
      journeyId,
      programmeId,
      programmeVersionId,
      deliveryMode,
      cohortId,
      intakeDate: intakeDate ? new Date(intakeDate) : undefined,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}
