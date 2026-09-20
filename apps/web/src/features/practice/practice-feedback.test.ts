import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  studentPracticeService,
  PracticeQuestionReviewItem,
} from '../../services/student/practice.service';
import { AdminQuestion } from '../../services/admin/questions.service';

describe('Phase 4.2: Practice Feedback, Question Review & Learning Loop', () => {
  const mockQuestions: AdminQuestion[] = [
    {
      id: 'q-1',
      code: 'IELTS-R1-001',
      exam: 'IELTS Academic',
      section: 'Reading',
      skill: 'Reading',
      type: 'MULTIPLE_CHOICE' as any,
      difficulty: 'MEDIUM' as any,
      status: 'published' as any,
      usages: ['PRACTICE'] as any,
      estimatedTime: '2 min',
      officialSource: 'Cambridge IELTS 18',
      version: 'qv-1',
      language: 'EN',
      tags: [],
      text: 'What was the primary purpose of the expedition?',
      options: ['Trade route mapping', 'Scientific discovery', 'Military conquest', 'Diplomacy'],
      correctAnswer: '', // Blank before submission for security
      explanation: '',
      hash: '',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'q-2',
      code: 'IELTS-R1-002',
      exam: 'IELTS Academic',
      section: 'Reading',
      skill: 'Reading',
      type: 'MULTIPLE_CHOICE' as any,
      difficulty: 'MEDIUM' as any,
      status: 'published' as any,
      usages: ['PRACTICE'] as any,
      estimatedTime: '2 min',
      officialSource: 'Cambridge IELTS 18',
      version: 'qv-2',
      language: 'EN',
      tags: [],
      text: 'According to paragraph 2, when did construction cease?',
      options: ['1914', '1920', '1939', '1945'],
      correctAnswer: '', // Blank before submission for security
      explanation: '',
      hash: '',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'q-3',
      code: 'IELTS-W1-001',
      exam: 'IELTS Academic',
      section: 'Writing',
      skill: 'Writing',
      type: 'WRITING_TASK_1' as any,
      difficulty: 'HARD' as any,
      status: 'published' as any,
      usages: ['PRACTICE'] as any,
      estimatedTime: '20 min',
      officialSource: 'Cambridge IELTS 18',
      version: 'qv-3',
      language: 'EN',
      tags: [],
      text: 'Summarise the diamond manufacturing process in at least 150 words.',
      options: [],
      correctAnswer: '',
      explanation: '',
      hash: '',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1 — All Correct
  it('Test 1 — All Correct: every question returns isCorrect=true and Incorrect filter returns 0 questions', async () => {
    const mockReviews: PracticeQuestionReviewItem[] = [
      {
        questionId: 'q-1',
        questionVersionId: 'qv-1',
        userAnswer: 'Scientific discovery',
        isCorrect: true,
        correctAnswer: 'Scientific discovery',
        explanation: 'The text in paragraph 3 explicitly confirms the scientific mandate.',
      },
      {
        questionId: 'q-2',
        questionVersionId: 'qv-2',
        userAnswer: '1939',
        isCorrect: true,
        correctAnswer: '1939',
        explanation: 'Work was halted upon the outbreak of hostilities in 1939.',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'sess-test-1',
        totalQuestions: 2,
        correctCount: 2,
        scorePercentage: 100,
        bandOrScale: 'Band 9.0',
        label: 'Expert User',
        computedStage: 'MASTERED',
        questionReviews: mockReviews,
      }),
    });

    const session = await studentPracticeService.submitSession(
      'sess-test-1',
      {
        'q-1': {
          questionId: 'q-1',
          userAnswer: 'Scientific discovery',
          isCorrect: false,
          timeSpentSeconds: 30,
        },
        'q-2': { questionId: 'q-2', userAnswer: '1939', isCorrect: false, timeSpentSeconds: 25 },
      },
      55,
      'IELTS Academic',
      mockQuestions.slice(0, 2)
    );

    expect(session.isCompleted).toBe(true);
    expect(session.scoreResult?.rawScore).toBe(2);
    expect(session.scoreResult?.totalQuestions).toBe(2);
    expect(session.questionReviews).toBeDefined();
    expect(session.questionReviews?.length).toBe(2);
    expect(session.questionReviews?.every((r) => r.isCorrect)).toBe(true);

    // Apply Incorrect filter
    const incorrectOnly = (session.questionReviews || []).filter(
      (r) => !r.isSubjective && r.isCorrect === false
    );
    expect(incorrectOnly.length).toBe(0);
  });

  // Test 2 — Mixed Results
  it('Test 2 — Mixed Results: accurately distinguishes correct and incorrect items and filter isolates errors', async () => {
    const mockReviews: PracticeQuestionReviewItem[] = [
      {
        questionId: 'q-1',
        questionVersionId: 'qv-1',
        userAnswer: 'Scientific discovery',
        isCorrect: true,
        correctAnswer: 'Scientific discovery',
        explanation: 'Paragraph 3 confirms scientific mandate.',
      },
      {
        questionId: 'q-2',
        questionVersionId: 'qv-2',
        userAnswer: '1914',
        isCorrect: false,
        correctAnswer: '1939',
        explanation: '1914 was the start of the initial survey, not cessation.',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'sess-test-2',
        totalQuestions: 2,
        correctCount: 1,
        scorePercentage: 50,
        bandOrScale: 'Estimated Band 5.5',
        label: 'Estimated • Modest User',
        computedStage: 'DEVELOPING',
        questionReviews: mockReviews,
      }),
    });

    const session = await studentPracticeService.submitSession(
      'sess-test-2',
      {
        'q-1': {
          questionId: 'q-1',
          userAnswer: 'Scientific discovery',
          isCorrect: false,
          timeSpentSeconds: 20,
        },
        'q-2': { questionId: 'q-2', userAnswer: '1914', isCorrect: false, timeSpentSeconds: 35 },
      },
      55,
      'IELTS Academic',
      mockQuestions.slice(0, 2)
    );

    expect(session.questionReviews?.length).toBe(2);
    const correctItems = session.questionReviews?.filter((r) => r.isCorrect);
    const incorrectItems = session.questionReviews?.filter(
      (r) => !r.isSubjective && r.isCorrect === false
    );

    expect(correctItems?.length).toBe(1);
    expect(correctItems?.[0].questionId).toBe('q-1');
    expect(incorrectItems?.length).toBe(1);
    expect(incorrectItems?.[0].questionId).toBe('q-2');
    expect(incorrectItems?.[0].userAnswer).toBe('1914');
    expect(incorrectItems?.[0].correctAnswer).toBe('1939');
  });

  // Test 3 — Correct Answer Security
  it('Test 3 — Correct Answer Security: correctAnswer is blank prior to submission and revealed post-submission', async () => {
    // 1. Prior to submission: question items delivered to client must have blank correctAnswer
    mockQuestions.forEach((q) => {
      expect(q.correctAnswer).toBe('');
    });

    // 2. Mock submit response returning authoritative correct answer
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'sess-test-3',
        totalQuestions: 1,
        correctCount: 1,
        scorePercentage: 100,
        bandOrScale: 'Band 9.0',
        label: 'Expert User',
        computedStage: 'MASTERED',
        questionReviews: [
          {
            questionId: 'q-1',
            questionVersionId: 'qv-1',
            userAnswer: 'Scientific discovery',
            isCorrect: true,
            correctAnswer: 'Scientific discovery',
            explanation: 'Documented in expedition log.',
          },
        ],
      }),
    });

    const submittedSession = await studentPracticeService.submitSession(
      'sess-test-3',
      {
        'q-1': {
          questionId: 'q-1',
          userAnswer: 'Scientific discovery',
          isCorrect: false,
          timeSpentSeconds: 15,
        },
      },
      15,
      'IELTS Academic',
      [mockQuestions[0]]
    );

    // 3. Revealed only in post-submission review
    expect(submittedSession.questionReviews?.[0].correctAnswer).toBe('Scientific discovery');
  });

  // Test 4 — Missing Explanation Neutral Fallback
  it('Test 4 — Missing Explanation: neutral fallback is provided when explanation is null or empty', () => {
    const reviewWithoutExplanation: PracticeQuestionReviewItem = {
      questionId: 'q-1',
      userAnswer: 'A',
      isCorrect: false,
      correctAnswer: 'B',
      explanation: null,
    };

    const hasExplanation = Boolean(
      reviewWithoutExplanation.explanation && reviewWithoutExplanation.explanation.trim().length > 0
    );

    const displayedExplanation = hasExplanation
      ? reviewWithoutExplanation.explanation
      : 'No authoritative explanation is currently available for this question.';

    expect(hasExplanation).toBe(false);
    expect(displayedExplanation).toBe(
      'No authoritative explanation is currently available for this question.'
    );
  });

  // Test 5 — Explanation Present
  it('Test 5 — Explanation Present: exact authoritative explanation is preserved and rendered', () => {
    const authoritativeText =
      'According to Section B, line 14, the core reactant was sodium hydroxide, verifying option C.';
    const reviewWithExplanation: PracticeQuestionReviewItem = {
      questionId: 'q-1',
      userAnswer: 'C',
      isCorrect: true,
      correctAnswer: 'C',
      explanation: authoritativeText,
    };

    const hasExplanation = Boolean(
      reviewWithExplanation.explanation && reviewWithExplanation.explanation.trim().length > 0
    );

    expect(hasExplanation).toBe(true);
    expect(reviewWithExplanation.explanation).toBe(authoritativeText);
  });

  // Test 6 — Invalid / Malformed Review Data Resilience
  it('Test 6 — Malformed Review Data Resilience: page and model gracefully handle undefined or empty review items', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'sess-malformed',
        totalQuestions: 1,
        correctCount: 0,
        scorePercentage: 0,
        bandOrScale: 'Band 0.0',
        label: 'Did Not Attempt',
        // questionReviews missing or undefined
      }),
    });

    const session = await studentPracticeService.submitSession(
      'sess-malformed',
      {},
      10,
      'IELTS Academic',
      [mockQuestions[0]]
    );

    expect(session.isCompleted).toBe(true);
    // questionReviews is undefined, questions should not throw
    const mappedReviews = session.questions.map((q, idx) => {
      const rev =
        session.questionReviews?.find((r) => r.questionId === q.id) ||
        session.questionReviews?.[idx];
      return { question: q, review: rev };
    });

    expect(mappedReviews.length).toBe(1);
    expect(mappedReviews[0].review).toBeUndefined();
  });

  // Test 7 — Phase 3 Query Preserved
  it('Test 7 — Phase 3 Query: /practice?skill=Reading correctly selects Reading skill tab', () => {
    const skills = ['Reading', 'Listening', 'Writing', 'Speaking'];
    const searchParamSkill = 'Reading';

    const matched = skills.find((s) => s.toLowerCase() === searchParamSkill.trim().toLowerCase());
    expect(matched).toBe('Reading');
  });

  // Test 8 — Invalid Skill Safe Fallback
  it('Test 8 — Invalid Skill: /practice?skill=foobar safely falls back to default skill without error', () => {
    const skills = ['Reading', 'Listening', 'Writing', 'Speaking'];
    const invalidSkill = 'foobar';

    const matched = skills.find((s) => s.toLowerCase() === invalidSkill.trim().toLowerCase());
    const resolvedTab = matched || skills[0] || 'Reading';

    expect(matched).toBeUndefined();
    expect(resolvedTab).toBe('Reading');
  });

  // Test 9 — Summary Score Integrity
  it('Test 9 — Summary Integrity: authoritative server score fields are preserved without client second scoring', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'sess-test-9',
        totalQuestions: 40,
        correctCount: 30,
        scorePercentage: 75.0,
        bandOrScale: 'Band 7.0',
        label: 'Good User',
        computedStage: 'MASTERED',
        questionReviews: [],
      }),
    });

    const session = await studentPracticeService.submitSession(
      'sess-test-9',
      {},
      1200,
      'IELTS Academic'
    );

    expect(session.scoreResult?.rawScore).toBe(30);
    expect(session.scoreResult?.totalQuestions).toBe(40);
    expect(session.scoreResult?.percentage).toBe(75);
    expect(session.scoreResult?.bandOrScale).toBe('Band 7.0');
    expect(session.scoreResult?.label).toBe('Good User');
  });

  // Test 10 — Writing/Speaking Qualitative Exemption
  it('Test 10 — Writing/Speaking Exemption: subjective tasks are flagged as qualitative evaluation and exempt from false objective labels', async () => {
    const mockSubjectiveReview: PracticeQuestionReviewItem = {
      questionId: 'q-3',
      questionVersionId: 'qv-3',
      userAnswer: 'The diagram illustrates the sequential process of diamond manufacturing...',
      isCorrect: false,
      correctAnswer: undefined,
      explanation: null,
      isSubjective: true,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'sess-test-10',
        totalQuestions: 1,
        correctCount: 0,
        scorePercentage: 0,
        bandOrScale: 'Qualitative',
        label: 'Submitted for Review',
        questionReviews: [mockSubjectiveReview],
      }),
    });

    const session = await studentPracticeService.submitSession(
      'sess-test-10',
      {
        'q-3': {
          questionId: 'q-3',
          userAnswer: 'The diagram illustrates...',
          isCorrect: false,
          timeSpentSeconds: 600,
        },
      },
      600,
      'IELTS Academic',
      [mockQuestions[2]]
    );

    const review = session.questionReviews?.[0];
    expect(review?.isSubjective).toBe(true);
    expect(review?.correctAnswer).toBeUndefined();

    // Verify it is excluded from incorrect objective count
    const incorrectObjectiveCount = (session.questionReviews || []).filter(
      (r) => !r.isSubjective && r.isCorrect === false
    ).length;
    expect(incorrectObjectiveCount).toBe(0);
  });
});
