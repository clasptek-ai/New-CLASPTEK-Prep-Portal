import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresQuestionRepository,
  PostgresQuestionReviewRepository,
} from './index';
import {
  Question,
  QuestionCode,
  QuestionReview,
  AnswerOption,
  Solution,
  Rubric,
} from '@clasptek/domain-question-bank';

let qSelectCount = 0;

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT') && sql.includes('questions')) {
      if (qSelectCount === 0) {
        qSelectCount++;
        return { rows: [], rowCount: 0 };
      }
      return {
        rows: [
          {
            id: 'd2000000-0000-0000-0000-000000000001',
            code: 'IELTS-MCQ-1',
            parent_question_id: null,
            current_version_id: 'qv-1',
            status: 'draft',
            tenant_id: 't-1',
            lock_version: 0,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('question_versions')) {
      return {
        rows: [
          {
            id: 'qv-1',
            question_id: 'd2000000-0000-0000-0000-000000000001',
            version_no: 1,
            version_label: 'v1.0.0',
            prompt: 'Q?',
            payload: { questionType: 'mcq_single' },
            explanation: 'Expl',
            status: 'draft',
            lock_version: 0,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('answer_options')) {
      return {
        rows: [
          {
            id: 'opt-1',
            question_version_id: 'qv-1',
            option_code: 'A',
            option_text: 'Opt Text',
            is_correct: true,
            display_order: 1,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('question_media')) {
      return {
        rows: [],
      };
    }
    if (sql.includes('SELECT') && sql.includes('solutions')) {
      return {
        rows: [
          {
            id: 'sol-1',
            question_version_id: 'qv-1',
            solution_type: 'general',
            content: 'Explanation content',
            target_option_id: null,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('rubrics')) {
      return {
        rows: [
          {
            id: 'rub-1',
            question_version_id: 'qv-1',
            criterion_name: 'Criteria',
            max_points: 1,
            description: 'Desc',
            grading_guidelines: {},
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('question_reviews')) {
      return {
        rows: [
          {
            id: 'rev-1',
            question_version_id: 'qv-1',
            stage: 'peer_review',
            assigned_reviewer_id: 'rev-99',
            status: 'approved',
            created_at: new Date(),
            completed_at: new Date(),
          },
        ],
      };
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

describe('Question Bank Postgres Repositories Integration Tests', () => {
  let dbPool: DatabasePool;
  let questionRepo: PostgresQuestionRepository;
  let reviewRepo: PostgresQuestionReviewRepository;
  const logger = new ConsoleLogger('PersistenceTest');
  const mockConfig = loadEnvironment(process.env);

  beforeEach(async () => {
    dbPool = new DatabasePool(mockConfig, logger);
    await dbPool.connect();
    questionRepo = new PostgresQuestionRepository(dbPool);
    reviewRepo = new PostgresQuestionReviewRepository(dbPool);
    qSelectCount = 0;
  });

  test('Save and Hydrate Question aggregate successfully', async () => {
    const qId = 'd2000000-0000-0000-0000-000000000001';
    const tenantId = 't2000000-0000-0000-0000-000000000001';
    const question = Question.create(qId, new QuestionCode('IELTS-MCQ-1'), null, tenantId);

    const ver = question.createVersion(
      'qv-1',
      1,
      'v1.0.0',
      'Q?',
      { questionType: 'mcq_single' },
      'Expl'
    );
    ver.addAnswerOption(new AnswerOption('opt-1', 'A', 'Opt Text', true, 1));
    ver.addSolution(new Solution('sol-1', 'general', 'Explanation content'));
    ver.addRubric(new Rubric('rub-1', 'Criteria', 1, 'Desc', {}));

    await questionRepo.save(question);

    const retrieved = await questionRepo.findById(qId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code.value).toBe('IELTS-MCQ-1');
    expect(retrieved!.versions.length).toBe(1);
    expect(retrieved!.versions[0].answerOptions.length).toBe(1);
    expect(retrieved!.versions[0].solutions.length).toBe(1);
    expect(retrieved!.versions[0].solutions[0].content).toBe('Explanation content');
  });

  test('Save and Hydrate QuestionReview aggregate successfully', async () => {
    const revId = 'rev-1';
    const review = QuestionReview.create(
      revId,
      'qv-1',
      'peer_review',
      'rev-99',
      'd2000000-0000-0000-0000-000000000001'
    );
    review.approve('rev-99', 'd2000000-0000-0000-0000-000000000001');

    await reviewRepo.save(review);

    const retrieved = await reviewRepo.findById(revId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.assignedReviewerId).toBe('rev-99');
    expect(retrieved!.status).toBe('approved');
  });
});
