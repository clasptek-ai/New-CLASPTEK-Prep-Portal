import { describe, it, expect } from 'vitest';
import {
  QuestionPackage,
  QuestionPackageItem,
  Passage,
  MediaAsset,
  PracticeAssessment,
  MockAssessment,
  AssessmentHealthService,
} from './index';

describe('Sprint 3.3.1 Canonical Aggregates — QuestionPackage', () => {
  it('creates a QuestionPackage and adds items', () => {
    const pkg = QuestionPackage.create(
      'pkg-1',
      'QP-IELTS-01',
      'IELTS Reading Package 1',
      'ielts-acad',
      'MEDIUM'
    );
    expect(pkg.status).toBe('DRAFT');
    expect(pkg.items.length).toBe(0);

    const item = new QuestionPackageItem('item-1', 'q-101', 'Q101', 1);
    pkg.addItem(item);
    expect(pkg.items.length).toBe(1);
    expect(pkg.items[0].questionId).toBe('q-101');
  });

  it('rejects duplicate question item additions', () => {
    const pkg = QuestionPackage.create(
      'pkg-2',
      'QP-IELTS-02',
      'IELTS Reading Package 2',
      'ielts-acad',
      'EASY'
    );
    const item = new QuestionPackageItem('item-1', 'q-101', 'Q101', 1);
    pkg.addItem(item);

    expect(() => pkg.addItem(item)).toThrow();
  });

  it('prevents publishing an empty QuestionPackage or non-approved package', () => {
    const pkg = QuestionPackage.create(
      'pkg-3',
      'QP-IELTS-03',
      'IELTS Package 3',
      'ielts-acad',
      'HARD'
    );
    expect(() => pkg.publish('user-admin')).toThrow();

    pkg.status = 'APPROVED';
    expect(() => pkg.publish('user-admin')).toThrow('Cannot publish an empty QuestionPackage');

    pkg.addItem(new QuestionPackageItem('item-1', 'q-201', 'Q201', 1));
    pkg.publish('user-admin');
    expect(pkg.status).toBe('PUBLISHED');
  });
});

describe('Sprint 3.3.1 Canonical Aggregates — Passage', () => {
  it('creates a Passage and tracks word counts', () => {
    const text =
      'Artificial Intelligence is revolutionizing global educational systems and assessment paradigms.';
    const passage = Passage.create('pas-1', 'PAS-01', 'AI in Education', 'READING', text);

    expect(passage.passageType).toBe('READING');
    expect(passage.versions.length).toBe(1);
    expect(passage.versions[0].wordCount).toBe(10);
  });

  it('adds new version and tracks question references', () => {
    const passage = Passage.create(
      'pas-2',
      'PAS-02',
      'Passage 2',
      'LISTENING_SCRIPT',
      'Audio transcript text.'
    );
    passage.addQuestionReference('q-101');
    passage.addQuestionReference('q-102');

    expect(passage.referencedQuestionIds.length).toBe(2);

    passage.addVersion(
      'Passage 2 v2',
      'Updated audio transcript text with more words.',
      'author-1'
    );
    expect(passage.versionNo).toBe(2);
    expect(passage.versions.length).toBe(2);
  });
});

describe('Sprint 3.3.1 Canonical Aggregates — MediaAsset', () => {
  it('creates MediaAsset and binds resource usage', () => {
    const media = MediaAsset.create(
      'med-1',
      'MED-01',
      'Chart 1',
      'image/png',
      'assets/c1.png',
      'bucket-1',
      1024,
      'sha256-abc'
    );
    expect(media.status).toBe('READY');
    expect(media.usageCount).toBe(0);

    media.bindUsage('QUESTION', 'q-101');
    expect(media.usageCount).toBe(1);

    // Prevents archiving while referenced
    expect(() => media.archive()).toThrow();

    media.unbindUsage('QUESTION', 'q-101');
    expect(media.usageCount).toBe(0);
    media.archive();
    expect(media.status).toBe('ARCHIVED');
  });
});

describe('Sprint 3.3.1 Canonical Aggregates — PracticeAssessment', () => {
  it('manages PracticeAssessment pool, publishing, and admin unlock', () => {
    const pa = PracticeAssessment.create(
      'pa-1',
      'PA-01',
      'IELTS Reading Practice',
      'ielts-acad',
      'skill-reading',
      { mode: 'IMMEDIATE', showExplanations: true, showHints: true },
      { hasTimeLimit: true, timeLimitMinutes: 30 }
    );

    expect(pa.status).toBe('DRAFT');
    expect(() => pa.publish()).toThrow();

    pa.setQuestionPool(['q-1', 'q-2', 'q-3']);
    pa.publish();
    expect(pa.status).toBe('PUBLISHED');

    pa.lock();
    expect(pa.status).toBe('LOCKED');
    expect(pa.isUnlockedByAdmin).toBe(false);

    pa.adminUnlock();
    expect(pa.status).toBe('PUBLISHED');
    expect(pa.isUnlockedByAdmin).toBe(true);
  });
});

describe('Sprint 3.3.1 Canonical Aggregates — MockAssessment', () => {
  it('allocates sections and enforces lock controls', () => {
    const mock = MockAssessment.create(
      'ma-1',
      'MA-01',
      'Official IELTS Mock 1',
      'ielts-acad',
      'bp-ielts-1'
    );
    mock.allocateSection({
      sectionCode: 'READING',
      blueprintSectionId: 'sec-r',
      questionIds: ['q-1', 'q-2'],
      allocatedDurationMinutes: 60,
    });

    expect(mock.totalQuestions).toBe(2);
    mock.publish();
    mock.lock();

    expect(() =>
      mock.allocateSection({
        sectionCode: 'LISTENING',
        blueprintSectionId: 'sec-l',
        questionIds: ['q-3'],
        allocatedDurationMinutes: 30,
      })
    ).toThrow();
  });
});

describe('Sprint 3.3.1 Domain Services — AssessmentHealthService', () => {
  it('calculates numerical health score and identifies gaps', () => {
    const service = new AssessmentHealthService();
    const result = service.calculateHealth({
      targetBlueprintCount: 40,
      allocatedQuestionCount: 40,
      targetSkillCount: 5,
      coveredSkillCount: 5,
      targetDifficultyDistribution: { EASY: 10, MEDIUM: 20, HARD: 10, EXPERT: 0 },
      allocatedDifficultyDistribution: { EASY: 10, MEDIUM: 20, HARD: 10, EXPERT: 0 },
      targetDurationMinutes: 60,
      allocatedDurationMinutes: 60,
      targetQuestionTypeCount: 3,
      coveredQuestionTypeCount: 3,
    });

    expect(result.score).toBe(100);
    expect(result.isHealthy).toBe(true);
    expect(result.recommendations.length).toBe(0);
  });
});
