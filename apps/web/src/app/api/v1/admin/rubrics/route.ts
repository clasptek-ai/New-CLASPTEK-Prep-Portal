export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

/**
 * Rubric shape used in GET responses and POST bodies.
 */
interface RubricRecord {
  id: string;
  name: string;
  questionType: 'WRITING' | 'SPEAKING';
  version: number;
  criteria: Array<{
    dimension: string;
    weight: number;
    descriptors: Record<string, string>;
  }>;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// In-memory store (replaces DB until PostgresRubricRepository is wired in)
// In production, swap this for a repository injected via getAiEvaluationContext.
// ---------------------------------------------------------------------------
const RUBRIC_STORE: RubricRecord[] = [
  {
    id: 'rubric-writing-v1',
    name: 'Writing Band Descriptor — v1',
    questionType: 'WRITING',
    version: 1,
    criteria: [
      {
        dimension: 'Task Achievement',
        weight: 0.25,
        descriptors: {
          9: 'Fully satisfies requirements',
          7: 'Adequately addresses task',
          5: 'Partially addresses task',
        },
      },
      {
        dimension: 'Coherence & Cohesion',
        weight: 0.25,
        descriptors: {
          9: 'Seamlessly sequences ideas',
          7: 'Generally well organised',
          5: 'Evident organisation issues',
        },
      },
      {
        dimension: 'Lexical Resource',
        weight: 0.25,
        descriptors: { 9: 'Wide range, sophisticated', 7: 'Sufficient range', 5: 'Limited range' },
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        weight: 0.25,
        descriptors: {
          9: 'Wide range, rare errors',
          7: 'Mix of simple and complex',
          5: 'Frequent errors',
        },
      },
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'rubric-speaking-v1',
    name: 'Speaking Band Descriptor — v1',
    questionType: 'SPEAKING',
    version: 1,
    criteria: [
      {
        dimension: 'Fluency & Coherence',
        weight: 0.25,
        descriptors: {
          9: 'Speaks fluently with ease',
          7: 'Able to express ideas readily',
          5: 'Noticeable pauses and hesitation',
        },
      },
      {
        dimension: 'Lexical Resource',
        weight: 0.25,
        descriptors: {
          9: 'Uses vocabulary naturally',
          7: 'Sufficient for the task',
          5: 'Restricted range',
        },
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        weight: 0.25,
        descriptors: {
          9: 'Wide range of structures',
          7: 'Mix of structures',
          5: 'Frequent errors',
        },
      },
      {
        dimension: 'Pronunciation',
        weight: 0.25,
        descriptors: {
          9: 'Consistently precise',
          7: 'Generally easy to understand',
          5: 'Causes listener difficulty',
        },
      },
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

/**
 * GET /api/v1/admin/rubrics
 * List all rubrics. Requires ADMIN role.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: requires ADMIN role' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const questionType = searchParams.get('questionType');

    let rubrics = RUBRIC_STORE;
    if (questionType) {
      rubrics = rubrics.filter((r) => r.questionType === questionType.toUpperCase());
    }

    return NextResponse.json({ rubrics, count: rubrics.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/rubrics
 * Register a new rubric version. Requires ADMIN role.
 *
 * Body: { name, questionType, version, criteria, isActive? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: requires ADMIN role' }, { status: 403 });
    }

    const body = await req.json();
    const { name, questionType, version, criteria, isActive = false } = body;

    if (!name || !questionType || version === undefined || !criteria) {
      return NextResponse.json(
        { error: 'Missing required fields: name, questionType, version, criteria' },
        { status: 400 }
      );
    }

    const validTypes = ['WRITING', 'SPEAKING'];
    if (!validTypes.includes(String(questionType).toUpperCase())) {
      return NextResponse.json(
        { error: `questionType must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const rubric: RubricRecord = {
      id: `rubric-${String(questionType).toLowerCase()}-v${version}-${Date.now()}`,
      name: String(name).trim(),
      questionType: String(questionType).toUpperCase() as 'WRITING' | 'SPEAKING',
      version: Number(version),
      criteria: Array.isArray(criteria) ? criteria : [],
      isActive: Boolean(isActive),
      createdBy: session.userId,
      createdAt: new Date().toISOString(),
    };

    RUBRIC_STORE.push(rubric);

    return NextResponse.json({ rubric }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
