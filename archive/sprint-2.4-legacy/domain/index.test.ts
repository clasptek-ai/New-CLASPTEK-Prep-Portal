import { describe, test, expect } from 'vitest';
import { Question, QuestionCode, SemanticVersion, ReviewRequest, QuestionMedia } from './index';

describe('Question Domain Aggregate Tests', () => {
  test('Instantiate QuestionCode and SemanticVersion successfully', () => {
    const code = new QuestionCode('IELTS-MCQ-1');
    expect(code.value).toBe('IELTS-MCQ-1');

    const version = new SemanticVersion('1.0.0');
    expect(version.value).toBe('1.0.0');
  });

  test('Instantiate empty QuestionCode throws validation error', () => {
    expect(() => new QuestionCode('')).toThrow('QuestionCode cannot be empty');
  });

  test('Create Question, append versions, and add options successfully', () => {
    const qId = 'q-123';
    const q = Question.create(qId, new QuestionCode('IELTS-Q1'), 'exam-1', 'mod-1');
    expect(q.id).toBe(qId);
    expect(q.status).toBe('DRAFT');

    const ver = q.createVersion('ver-1', new SemanticVersion('1.0.0'), 'Title 1', { prompt: 'Q?' });
    expect(ver.title).toBe('Title 1');
    expect(q.versions.length).toBe(1);

    q.addAnswerOption(new SemanticVersion('1.0.0'), 'opt-1', 'A', 'Option text', true, 1);
    expect(ver.answerOptions.length).toBe(1);
    expect(ver.answerOptions[0].code).toBe('A');
    expect(ver.answerOptions[0].isCorrect).toBe(true);

    q.publish(new SemanticVersion('1.0.0'));
    expect(q.status).toBe('PUBLISHED');
    expect(ver.status).toBe('PUBLISHED');
  });

  test('Add media and access details on QuestionVersion', () => {
    const q = Question.create('q-2', new QuestionCode('IELTS-Q2'), 'exam-1', 'mod-1');
    q.createVersion('ver-2', new SemanticVersion('1.0.0'), 'Title', {});

    const media = new QuestionMedia(
      'med-1',
      'SUPABASE',
      'assets',
      'audio.mp3',
      'chk-sum',
      'audio/mp3',
      45000,
      120,
      'Transcript sample',
      'Caption sample',
      'thumb.png',
      'Alt text text'
    );
    q.addMedia(new SemanticVersion('1.0.0'), media);

    expect(q.versions[0].mediaAssets.length).toBe(1);
    expect(q.versions[0].mediaAssets[0].objectKey).toBe('audio.mp3');
    expect(q.versions[0].mediaAssets[0].altText).toBe('Alt text text');
  });

  test('ReviewRequest and Review Comments workflow tracking', () => {
    const req = ReviewRequest.create('req-1', 'q-1');
    expect(req.status).toBe('UNDER_REVIEW');

    req.addValidationReport('rep-1', 'IELTS_Validator', true, []);
    req.addComment('c-1', 'rev-99', 'academic_reviewer', 'Looking correct.');
    req.approve('rev-99', 'Final check approved', 'h-1');

    expect(req.status).toBe('APPROVED');
    expect(req.validationReports.length).toBe(1);
    expect(req.reviewerComments.length).toBe(1);
    expect(req.history.length).toBe(1);
    expect(req.history[0].comments).toBe('Final check approved');
  });
});
