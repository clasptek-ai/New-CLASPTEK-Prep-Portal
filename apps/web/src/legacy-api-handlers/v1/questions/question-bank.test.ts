/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables before config module loads
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { POST as createQuestionApi } from '../admin/questions/route';
import { PATCH as updateQuestionApi } from '../admin/questions/[id]/route';
import { POST as publishQuestionApi } from '../admin/questions/[id]/publish/route';
import { POST as archiveQuestionApi } from '../admin/questions/[id]/archive/route';
import { POST as restoreQuestionApi } from '../admin/questions/[id]/restore/route';
import { POST as createVersionApi } from '../admin/questions/[id]/create-version/route';
import { POST as uploadMediaApi } from '../admin/questions/[id]/upload-media/route';
import { POST as bulkImportApi } from '../admin/questions/bulk-import/route';
import { GET as listQuestionsApi } from './route';
import { GET as getQuestionApi } from './[id]/route';
import { GET as searchQuestionsApi } from './search/route';

const mockQuestions = new Map<string, any>();
const mockVersions = new Map<string, any>();
const mockOptions = new Map<string, any>();
const mockSolutions = new Map<string, any>();
const mockRubrics = new Map<string, any>();
const mockMedia = new Map<string, any>();
const mockReviews = new Map<string, any>();

// Mock pg module queries
vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
    // 1. INSERT / SAVE
    if (sql.includes('INSERT INTO') && sql.includes('questions')) {
      if (params) {
        const id = params[0];
        const code = params[1];
        const status = params.length > 5 ? params[4] : params[4];
        mockQuestions.set(id, { id, code: code, status: status || 'draft', lock_version: 0 });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO') && sql.includes('question_versions')) {
      if (params) {
        const id = params[0];
        const question_id = params[1];
        const version_no = params[2];
        const version_label = params[3];
        const title = params[4];
        const payload = params[5];
        mockVersions.set(id, {
          id,
          question_id,
          version_no,
          version_label,
          status: 'draft',
          title,
          payload,
          lock_version: 0,
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO') && sql.includes('answer_options')) {
      if (params) {
        const id = params[0];
        const question_version_id = params[1];
        const code = params[2];
        const text_content = params[3];
        const is_correct = params[4];
        const display_order = params[5];
        mockOptions.set(id, {
          id,
          question_version_id,
          code,
          option_code: code,
          text_content,
          option_text: text_content,
          is_correct,
          display_order,
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO') && sql.includes('solutions')) {
      if (params) {
        const id = params[0];
        const question_version_id = params[1];
        const explanation = params[3];
        mockSolutions.set(id, { id, question_version_id, explanation, hint: 'Hint' });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO') && sql.includes('rubrics')) {
      if (params) {
        const id = params[0];
        const question_version_id = params[1];
        const criteria = params[2];
        const max_points = params[3];
        const description = params[4];
        mockRubrics.set(id, { id, question_version_id, criteria, max_points, description });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO') && sql.includes('question_reviews')) {
      if (params) {
        const id = params[0];
        const question_id = params[1];
        const reviewer_id = params[2];
        const status = params[4];
        mockReviews.set(id, { id, question_id, reviewer_id, status });
        mockReviews.set(question_id, { id, question_id, reviewer_id, status });
      }
      return { rowCount: 1 };
    }

    // 2. DELETE / UPDATE
    if (sql.includes('DELETE FROM') || sql.includes('UPDATE')) {
      return { rowCount: 1 };
    }

    // 3. SELECT / QUERY
    if (
      sql.includes('SELECT 1 FROM') &&
      (sql.includes('questions') || sql.includes('question_versions'))
    ) {
      return { rows: [], rowCount: 0 };
    }
    if (
      sql.includes('SELECT lock_version FROM') ||
      (sql.includes('SELECT') &&
        sql.includes('questions') &&
        !sql.includes('question_versions') &&
        !sql.includes('question_media') &&
        !sql.includes('question_reviews') &&
        !sql.includes('question_dependencies') &&
        !sql.includes('question_statistics') &&
        !sql.includes('question_ownership'))
    ) {
      const id = params ? params[0] : '';
      const q = mockQuestions.get(id);
      return { rows: q ? [q] : [], rowCount: q ? 1 : 0 };
    }
    if (sql.includes('SELECT') && sql.includes('question_versions')) {
      const qId = params ? params[0] : '';
      const list = Array.from(mockVersions.values()).filter((v: any) => v.question_id === qId);
      return { rows: list, rowCount: list.length };
    }
    if (sql.includes('SELECT') && sql.includes('answer_options')) {
      const vId = params ? params[0] : '';
      const list = Array.from(mockOptions.values()).filter(
        (o: any) => o.question_version_id === vId
      );
      return { rows: list, rowCount: list.length };
    }
    if (sql.includes('SELECT') && sql.includes('solutions')) {
      const vId = params ? params[0] : '';
      const list = Array.from(mockSolutions.values()).filter(
        (s: any) => s.question_version_id === vId
      );
      return { rows: list, rowCount: list.length };
    }
    if (sql.includes('SELECT') && sql.includes('rubrics')) {
      const vId = params ? params[0] : '';
      const list = Array.from(mockRubrics.values()).filter(
        (r: any) => r.question_version_id === vId
      );
      return { rows: list, rowCount: list.length };
    }
    if (sql.includes('SELECT') && sql.includes('question_reviews')) {
      const qId = params ? params[0] : '';
      const r = mockReviews.get(qId);
      return { rows: r ? [r] : [], rowCount: r ? 1 : 0 };
    }

    return { rows: [], rowCount: 0 };
  });

  return {
    Pool: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue({
          release: vi.fn(),
          query: queryMock,
        }),
        end: vi.fn().mockResolvedValue(undefined),
        query: queryMock,
      };
    }),
  };
});

describe('Question Bank REST API Controller Integration Tests', () => {
  beforeEach(() => {
    mockQuestions.clear();
    mockVersions.clear();
    mockOptions.clear();
    mockSolutions.clear();
    mockRubrics.clear();
    mockMedia.clear();
    mockReviews.clear();
  });

  test('Complete Question creation, versioning, options setup, approval, and publish sequence', async () => {
    // 1. Create Question
    const createReq = new NextRequest('http://localhost/api/v1/admin/questions', {
      method: 'POST',
      body: JSON.stringify({
        code: 'IELTS-MCQ-1',
        examProductId: 'e-1',
        curriculumModuleId: 'm-1',
      }),
    });
    const createRes = await createQuestionApi(createReq);
    expect(createRes.status).toBe(201);
    const createBody = await createRes.json();
    expect(createBody.success).toBe(true);

    const questionId = createBody.id;

    // 2. Create Version
    const verReq = new NextRequest(
      `http://localhost/api/v1/admin/questions/${questionId}/create-version`,
      {
        method: 'POST',
        body: JSON.stringify({
          versionNo: '1.0.0',
          title: 'Diagnostic Question 1',
          payload: { prompt: 'What is the answer?' },
        }),
      }
    );
    const verRes = await createVersionApi(verReq, { params: Promise.resolve({ id: questionId }) });
    expect(verRes.status).toBe(200);

    // 3. Add Option, Solution, and Rubric via PATCH
    const patchReq = new NextRequest(`http://localhost/api/v1/admin/questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'addAnswerOption',
        versionNo: '1.0.0',
        optId: 'opt-1',
        optCode: 'A',
        optText: 'Option Text',
        isCorrect: true,
        displayOrder: 1,
      }),
    });
    const patchRes = await updateQuestionApi(patchReq, {
      params: Promise.resolve({ id: questionId }),
    });
    expect(patchRes.status).toBe(200);

    // 4. Mock approval directly in review map (required for publish check)
    const mockReviewObj = {
      id: 'rev-1',
      question_id: questionId,
      reviewer_id: 'rev-99',
      reviewer_role: 'academic_reviewer',
      status: 'APPROVED',
    };
    mockReviews.set(questionId, mockReviewObj);
    mockReviews.set('rev-1', mockReviewObj);

    // 5. Publish Question version
    const publishReq = new NextRequest(
      `http://localhost/api/v1/admin/questions/${questionId}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({
          versionNo: '1.0.0',
        }),
      }
    );
    const publishRes = await publishQuestionApi(publishReq, {
      params: Promise.resolve({ id: questionId }),
    });
    expect(publishRes.status).toBe(200);

    // 6. Retrieve public details
    const getReq = new NextRequest(`http://localhost/api/v1/questions/${questionId}`);
    const getRes = await getQuestionApi(getReq, { params: Promise.resolve({ id: questionId }) });
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.code).toBe('IELTS-MCQ-1');
    expect(getBody.versions.length).toBe(1);
    expect(getBody.versions[0].answerOptions[0].code).toBe('A');
  });

  test('Bulk Import questions successfully', async () => {
    const importReq = new NextRequest('http://localhost/api/v1/admin/questions/bulk-import', {
      method: 'POST',
      body: JSON.stringify({
        payloads: [
          { code: 'IELTS-MCQ-2', title: 'Q2' },
          { code: 'IELTS-MCQ-3', title: 'Q3' },
        ],
      }),
    });
    const importRes = await bulkImportApi(importReq);
    expect(importRes.status).toBe(200);
    const importBody = await importRes.json();
    expect(importBody.success).toBe(true);
    expect(importBody.importedIds.length).toBe(2);
  });
});
