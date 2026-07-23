import type { StartPracticeSessionHandler, CompletePracticeSessionHandler } from './index';

export class StartPracticeAdapter {
  constructor(private readonly startHandler: StartPracticeSessionHandler) {}
  public async execute(cmd: { sessionId: string }): Promise<void> {
    return this.startHandler.execute({ sessionId: cmd.sessionId });
  }
}

export class SubmitPracticeAdapter {
  constructor(private readonly completeHandler: CompletePracticeSessionHandler) {}
  public async execute(cmd: { sessionId: string }): Promise<void> {
    return this.completeHandler.execute({
      sessionId: cmd.sessionId,
      completedAt: new Date(),
    });
  }
}

export class BookmarkQuestionAdapter {
  public async execute(cmd: {
    studentId: string;
    questionId: string;
    category?: string;
  }): Promise<{ bookmarkId: string }> {
    return {
      bookmarkId: `bmk-${cmd.studentId}-${cmd.questionId}`,
    };
  }
}

export class RetryPracticeHandler {
  public async execute(cmd: {
    sessionId: string;
    studentId: string;
  }): Promise<{ newSessionId: string }> {
    return {
      newSessionId: `ses-retry-${cmd.sessionId}-${Date.now()}`,
    };
  }
}

export class GetPracticeHistoryAdapter {
  public async execute(cmd: { studentId: string }): Promise<any[]> {
    return [
      {
        sessionId: 'ses-hist-1',
        studentId: cmd.studentId,
        title: 'IELTS Vocabulary Practice Set',
        accuracy: 85.0,
        completedAt: new Date().toISOString(),
      },
    ];
  }
}

export class GetPracticeResultsAdapter {
  public async execute(cmd: { sessionId: string }): Promise<any> {
    return {
      sessionId: cmd.sessionId,
      overallScore: 85.0,
      accuracyPercentage: 85.0,
      timeTakenSeconds: 1200,
      skillScores: [
        {
          skillId: 'sk-grammar-1',
          skillName: 'Grammar Accuracy',
          score: 85,
          maxScore: 100,
          percentage: 85.0,
        },
      ],
    };
  }
}

export class GetBookmarksAdapter {
  public async execute(cmd: { studentId: string }): Promise<any[]> {
    return [
      {
        bookmarkId: 'bmk-1',
        studentId: cmd.studentId,
        questionId: 'q-101',
        category: 'GENERAL',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

export class GetReviewQueueAdapter {
  public async execute(cmd: { sessionId: string }): Promise<any[]> {
    return [
      {
        sessionId: cmd.sessionId,
        questionId: 'q-101',
        isReviewed: false,
        orderIndex: 1,
      },
    ];
  }
}
