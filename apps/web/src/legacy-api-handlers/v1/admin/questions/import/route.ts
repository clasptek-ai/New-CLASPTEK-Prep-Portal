export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession, isValidTenantUuid } from '@/lib/auth-util';
import { CanonicalJsonImporterRepository } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

interface QuestionImportPayload {
  examType?: string;
  assessmentCode?: string;
  questions: Array<{
    questionCode?: string;
    code?: string;
    passageCode?: string;
    type?: string;
    questionType?: string;
    skill?: string;
    difficulty?: string;
    prompt: string;
    options?: any[];
    correctAnswer: string;
    explanation?: string;
    usages?: string[];
  }>;
}

export async function POST(req: NextRequest) {
  const logger = new ConsoleLogger('admin-question-import');

  try {
    const session = await getAuthenticatedSession(req);
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const tenantId = session?.tenantId;
    if (!tenantId || !isValidTenantUuid(tenantId)) {
      return NextResponse.json(
        {
          error: 'INVALID_TENANT_CONTEXT',
          message: 'A valid authorized tenant context is required for Question Bank import.',
          referenceCode: 'INVALID_TENANT_CONTEXT',
          failingOperation: 'RESOLVE_TENANT_CONTEXT',
        },
        { status: 400 }
      );
    }

    const body: QuestionImportPayload = await req.json();

    if (!body || !Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payload: questions array is required and cannot be empty.',
        },
        { status: 400 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const importerRepo = new CanonicalJsonImporterRepository(dbPool.getPool());

    // Normalize payload to canonical contract
    const canonicalPayload = {
      schemaVersion: '1.0',
      examType: body.examType || 'English Proficiency',
      questions: body.questions.map((q) => ({
        questionCode: q.questionCode || q.code,
        questionType: q.questionType || q.type || 'MCQ',
        difficulty: q.difficulty || 'MEDIUM',
        prompt: q.prompt,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        usages: q.usages || ['PRACTICE'],
      })),
    };

    const importRes = await importerRepo.importJsonBatch(
      canonicalPayload,
      session?.userId || 'admin-legacy-import',
      tenantId
    );

    return NextResponse.json(
      {
        success: true,
        examType: body.examType || 'English Proficiency',
        batchId: importRes.batchId,
        batchCode: importRes.batchCode,
        importedCount: importRes.importedCount,
        message: `Successfully processed ${importRes.importedCount} questions.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logger.error('Error executing question bank bulk import', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: err.failingOperation === 'RESOLVE_TENANT_CONTEXT' ? 400 : 500 }
    );
  }
}
