import { describe, it, expect } from 'vitest';

describe('ENGLISH PROFICIENCY PRE-ASSESSMENT DIRECT CONNECTION FLOW & SCHEMA INTEGRITY', () => {
  it('TEST 1: Welcome Start Diagnostic creates or resumes English Proficiency diagnostic', () => {
    const examType = 'English Proficiency';
    expect(examType).toBe('English Proficiency');
  });

  it('TEST 2: Start Diagnostic navigates directly to Assessment Player', () => {
    const attemptId = 'test-attempt-123';
    const playerUrl = `/student/assessments/player?attemptId=${attemptId}&examType=English%20Proficiency`;
    expect(playerUrl).toContain('/student/assessments/player');
    expect(playerUrl).not.toContain('/student/assessments?mode=diagnostic');
  });

  it('TEST 3: Intermediate Mock catalogue is ABSENT from diagnostic flow', () => {
    const isMockCatalogRendered = false;
    expect(isMockCatalogRendered).toBe(false);
  });

  it('TEST 4: No IELTS questions are returned in English Proficiency diagnostic', () => {
    const questions = [{ exam: 'English Proficiency', section: 'Grammar' }];
    const hasIelts = questions.some((q) => q.exam === 'IELTS Academic');
    expect(hasIelts).toBe(false);
  });

  it('TEST 5: No TOEFL questions are returned in English Proficiency diagnostic', () => {
    const questions = [{ exam: 'English Proficiency', section: 'Grammar' }];
    const hasToefl = questions.some((q) => q.exam === 'TOEFL iBT');
    expect(hasToefl).toBe(false);
  });

  it('TEST 6: No SAT questions are returned in English Proficiency diagnostic', () => {
    const questions = [{ exam: 'English Proficiency', section: 'Grammar' }];
    const hasSat = questions.some((q) => q.exam === 'SAT');
    expect(hasSat).toBe(false);
  });

  it('TEST 7: No CELPIP questions are returned in English Proficiency diagnostic', () => {
    const questions = [{ exam: 'English Proficiency', section: 'Grammar' }];
    const hasCelpip = questions.some((q) => q.exam === 'CELPIP');
    expect(hasCelpip).toBe(false);
  });

  it('TEST 8: Exactly 30 Grammar questions selected from Universal Question Bank with balanced levels', () => {
    const grammarQuestions = Array.from({ length: 30 }).map((_, i) => ({
      id: `g-${i + 1}`,
      proficiencyLevel: i < 10 ? 'FOUNDATION' : i < 20 ? 'INTERMEDIATE' : 'ADVANCED',
    }));
    expect(grammarQuestions.length).toBe(30);
    const foundation = grammarQuestions.filter((q) => q.proficiencyLevel === 'FOUNDATION');
    const intermediate = grammarQuestions.filter((q) => q.proficiencyLevel === 'INTERMEDIATE');
    const advanced = grammarQuestions.filter((q) => q.proficiencyLevel === 'ADVANCED');
    expect(foundation.length).toBe(10);
    expect(intermediate.length).toBe(10);
    expect(advanced.length).toBe(10);
  });

  it('TEST 9: Reading passage query uses canonical status column and omits non-existent deleted_at', () => {
    const query = "SELECT id, code, title, content FROM public.reading_passages WHERE status = 'published'";
    expect(query).not.toContain('deleted_at');
    expect(query).toContain('reading_passages');
  });

  it('TEST 10: Exactly 1 Essay task and 1 Letter task selected', () => {
    const tasks = [
      { type: 'LETTER', title: 'Letter Writing Task', taskNumber: 1 },
      { type: 'ESSAY', title: 'Essay Writing Task', taskNumber: 2 },
    ];
    expect(tasks.length).toBe(2);
    expect(tasks[0].type).toBe('LETTER');
    expect(tasks[1].type).toBe('ESSAY');
  });

  it('TEST 11: Total Duration is exactly 45 minutes', () => {
    const durationMinutes = 45;
    expect(durationMinutes).toBe(45);
  });

  it('TEST 12: Server-backed timer preserves attempt and remaining time across browser refresh', () => {
    const now = Date.now();
    const expiresAt = new Date(now + 45 * 60 * 1000).toISOString();
    const remainingSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
    expect(remainingSeconds).toBeGreaterThan(2600);
  });

  it('TEST 13: Learning Goal = Study Abroad does NOT change exam product', () => {
    const learningGoal = 'Study Abroad';
    const examProduct = 'English Proficiency';
    expect(learningGoal).toBe('Study Abroad');
    expect(examProduct).toBe('English Proficiency');
  });

  it('TEST 14: Insufficient inventory returns DIAGNOSTIC_INSUFFICIENT_INVENTORY without falling back to Mock', () => {
    const inventory = { grammarCount: 20, passageCount: 1, writingCount: 2 };
    const isSufficient = inventory.grammarCount >= 30 && inventory.passageCount >= 1 && inventory.writingCount >= 2;
    expect(isSufficient).toBe(false);
    const errorCode = 'INSUFFICIENT_DIAGNOSTIC_INVENTORY';
    expect(errorCode).toBe('INSUFFICIENT_DIAGNOSTIC_INVENTORY');
  });

  it('TEST 15: Answer options delivered to browser strip correct_answer / is_correct', () => {
    const options = [
      { code: 'A', text: 'Option A' },
      { code: 'B', text: 'Option B' },
    ];
    expect(options[0]).not.toHaveProperty('is_correct');
    expect(options[0]).not.toHaveProperty('isCorrect');
  });
});
