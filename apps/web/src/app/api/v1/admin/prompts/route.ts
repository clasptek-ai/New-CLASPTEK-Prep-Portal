export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

/**
 * GET /api/v1/admin/prompts
 *
 * List prompt versions / experiments.
 * Requires ADMIN, SUPER_ADMIN, or ADMINISTRATOR role.
 * Query: ?tenantId=&experimentId=
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
    const tenantId = searchParams.get('tenantId') ?? 'default';
    const experimentId = searchParams.get('experimentId');

    const ctx = getAiEvaluationContext();

    if (experimentId) {
      // Return comparison results for a specific experiment
      const [performance, comparisons] = await Promise.all([
        ctx.getPromptComparison.execute(experimentId),
        ctx.getPromptComparison.execute(experimentId),
      ]);
      return NextResponse.json({ experimentId, comparisons, performance });
    }

    // Return benchmark runs as a proxy for prompt version history
    const runs = await ctx.getBenchmarkRuns.execute(tenantId);

    return NextResponse.json({ runs, count: runs.length, tenantId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/prompts
 *
 * Register a new prompt version via PromptAggregate.
 * Requires ADMIN, SUPER_ADMIN, or ADMINISTRATOR role.
 *
 * Body: {
 *   tenantId?: string,
 *   templateId: string,
 *   versionNumber: number,
 *   systemPrompt: string,
 *   userPromptTemplate: string
 * }
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
    const {
      tenantId = 'default',
      templateId,
      versionNumber,
      systemPrompt,
      userPromptTemplate,
    } = body;

    if (!templateId || versionNumber === undefined || !systemPrompt || !userPromptTemplate) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: templateId, versionNumber, systemPrompt, userPromptTemplate',
        },
        { status: 400 }
      );
    }

    if (systemPrompt.trim().length < 20) {
      return NextResponse.json(
        { error: 'systemPrompt must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (userPromptTemplate.trim().length < 10) {
      return NextResponse.json(
        { error: 'userPromptTemplate must be at least 10 characters' },
        { status: 400 }
      );
    }

    const ctx = getAiEvaluationContext();

    const versionId = await ctx.registerPromptVersion.execute({
      tenantId,
      templateId,
      versionNumber: Number(versionNumber),
      systemPrompt: systemPrompt.trim(),
      userPromptTemplate: userPromptTemplate.trim(),
      createdBy: session.userId,
    });

    return NextResponse.json(
      {
        versionId,
        templateId,
        versionNumber,
        message: 'Prompt version registered successfully',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
