export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const { templateId, versionNumber, systemPrompt, userPromptTemplate } = body;

    if (!templateId || !versionNumber || !systemPrompt || !userPromptTemplate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const versionId = await ctx.registerPromptVersion.execute({
      tenantId: session.tenantId ?? '00000000-0000-0000-0000-000000000000',
      templateId,
      versionNumber,
      systemPrompt,
      userPromptTemplate,
      createdBy: session.userId,
    });

    return NextResponse.json({ success: true, versionId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
