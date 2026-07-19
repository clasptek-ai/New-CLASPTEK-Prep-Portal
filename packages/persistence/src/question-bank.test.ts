import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool, PostgresQuestionRepository, PostgresQuestionReviewRepository } from './index';
import {
  Question,
  QuestionCode,
  SemanticVersion,
  ReviewRequest
} from '@clasptek/domain-question-bank';

let qSelectCount = 0;
let rSelectCount = 0;

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT') && sql.includes('questions')) {
      if (qSelectCount === 0) {
        qSelectCount++;
        return { rows: [], rowCount: 0 };
      }
      return {
        rows: [{
          id: 'd2000000-0000-0000-0000-000000000001',
          code: 'IELTS-MCQ-1',
          exam_product_id: 'e-1',
          curriculum_module_id: 'm-1',
          status: 'DRAFT',
          lock_version: 0
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('question_versions')) {
      return {
        rows: [{
          id: 'd3000000-0000-0000-0000-000000000001',
          question_id: 'd2000000-0000-0000-0000-000000000001',
          version_no: '1.0.0',
          status: 'DRAFT',
          title: 'Title',
          payload: { prompt: 'Q?' },
          digital_signature: 'sig-123',
          lock_version: 0
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('answer_options')) {
      return {
        rows: [{
          id: 'opt-1',
          question_version_id: 'd3000000-0000-0000-0000-000000000001',
          code: 'A',
          text_content: 'Opt Text',
          is_correct: true,
          display_order: 1
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('question_media')) {
      return {
        rows: [{
          id: 'm-1',
          question_version_id: 'd3000000-0000-0000-0000-000000000001',
          provider: 'SUPABASE',
          bucket: 'assets',
          object_key: 'audio.mp3',
          checksum: 'chk-sum',
          mime_type: 'audio/mp3',
          file_size: 45000,
          duration_seconds: 120,
          transcript: 'sample transcript',
          caption: 'sample caption',
          thumbnail_key: 'thumb.png',
          alt_text: 'sample alt text'
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('solutions')) {
      return {
        rows: [{
          id: 'sol-1',
          question_version_id: 'd3000000-0000-0000-0000-000000000001',
          explanation: 'Expl',
          incorrect_explanation: 'IncorrectExpl',
          hint: 'Hint',
          reference_url: 'http://ref.com',
          teaching_note: 'Note'
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('rubrics')) {
      return {
        rows: [{
          id: 'rub-1',
          question_version_id: 'd3000000-0000-0000-0000-000000000001',
          criteria: 'Criteria',
          max_points: 1,
          description: 'Desc'
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('question_reviews')) {
      if (rSelectCount === 0) {
        rSelectCount++;
        return { rows: [], rowCount: 0 };
      }
      return {
        rows: [{
          id: 'rev-1',
          question_id: 'd2000000-0000-0000-0000-000000000001',
          status: 'APPROVED'
        }]
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
    })
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
    rSelectCount = 0;
  });

  test('Save and Hydrate Question aggregate successfully', async () => {
    const qId = 'd2000000-0000-0000-0000-000000000001';
    const question = Question.create(qId, new QuestionCode('IELTS-MCQ-1'), 'e-1', 'm-1');
    question.createVersion('qv-1', new SemanticVersion('1.0.0'), 'Title 1', { prompt: 'Q?' });
    question.addAnswerOption(new SemanticVersion('1.0.0'), 'opt-1', 'A', 'Text', true, 1);
    question.setSolution(new SemanticVersion('1.0.0'), 'sol-1', 'Expl', 'Incorrect', 'Hint', 'http://url.com', 'Note');
    question.setRubric(new SemanticVersion('1.0.0'), 'rub-1', 'Criteria', 1, 'Desc');

    await questionRepo.save(question);

    const retrieved = await questionRepo.findById(qId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code.value).toBe('IELTS-MCQ-1');
    expect(retrieved!.versions.length).toBe(1);
    expect(retrieved!.versions[0].answerOptions.length).toBe(1);
    expect(retrieved!.versions[0].solution).not.toBeNull();
    expect(retrieved!.versions[0].solution!.hint).toBe('Hint');
  });

  test('Save and Hydrate ReviewRequest aggregate successfully', async () => {
    const revId = 'rev-1';
    const review = ReviewRequest.create(revId, 'd2000000-0000-0000-0000-000000000001');
    review.approve('rev-99', 'Approved!', 'h-1');

    await reviewRepo.save(review);

    const retrieved = await reviewRepo.findById(revId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.questionId).toBe('d2000000-0000-0000-0000-000000000001');
    expect(retrieved!.status).toBe('APPROVED');
  });
});
