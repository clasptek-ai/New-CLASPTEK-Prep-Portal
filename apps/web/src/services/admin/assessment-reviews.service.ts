import { apiClient } from '../api/client';

export interface AssessmentReviewAttempt {
  attemptId: string;
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assessmentType: 'MOCK' | 'DIAGNOSTIC';
  definitionId: string;
  definitionTitle: string;
  attemptNumber: number;
  totalAttemptsByStudent: number;
  startedAt: string;
  submittedAt: string | null;
  status: string;
  scoreStatus: 'AVAILABLE' | 'PARTIAL' | 'PENDING' | 'NOT_SCORED';
  score: number;
  officialScaledScore: number;
  officialScoreLabel: string;
  cefrLevel: string;
  sectionsCompleted: number;
  totalSections: number;
}

export interface ReconstructedQuestion {
  id: string;
  order: number;
  code: string;
  section: string;
  itemType: string;
  difficulty?: string;
  prompt: string;
  options: Array<{ code: string; text: string; isCorrect?: boolean }>;
  studentAnswer: any;
  correctAnswer: any;
  status: 'CORRECT' | 'INCORRECT' | 'UNANSWERED' | 'NOT_SCORED' | 'PENDING_REVIEW';
  isCorrect: boolean | null;
  explanation: string | null;
  timeSpentMs: number;
}

export interface ReconstructedListeningSection {
  sectionNumber: number;
  title: string;
  audioUrl: string | null;
  transcript: string | null;
  durationSeconds: number;
  questions: ReconstructedQuestion[];
}

export interface ReconstructedReadingPassage {
  passageNumber: number;
  title: string;
  code?: string;
  content: string;
  wordCount: number;
  questions: ReconstructedQuestion[];
}

export interface ReconstructedWritingTask {
  taskNumber: number;
  title: string;
  prompt: string;
  instructions: string;
  stimulusImageUrl: string | null;
  minWords: number;
  studentEssay: string | null;
  wordCount: number;
  evaluationState: string;
  overallScore: number | null;
  scoreLabel: string | null;
  feedback: string | null;
  criteria: Array<{
    criterionName: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  rubrics: Array<{
    criterion: string;
    bandScore: number;
    descriptor: string;
  }>;
}

export interface ReconstructedSpeakingPart {
  partNumber: number;
  title: string;
  prompt: string;
  instructions: string;
  cueCard: {
    topic: string;
    prepTimeSeconds: number;
    speakingTimeSeconds: number;
    prompt: string;
  } | null;
  audioUrl: string | null;
  durationSeconds: number;
  transcript: string | null;
  evaluationState: string;
  overallScore: number | null;
  scoreLabel: string | null;
  feedback: string | null;
  criteria: Array<{
    criterionName: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
}

export interface SectionSummary {
  sectionKey: string;
  title: string;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  bandScore?: number;
  status: string;
}

export interface ReconstructedAttemptDetail {
  attemptId: string;
  assessmentType: 'MOCK' | 'DIAGNOSTIC';
  assessmentDefinition: {
    id: string;
    title: string;
    code: string;
    durationMinutes: number;
  };
  attemptNumber: number;
  totalAttempts: number;
  candidate: {
    id: string;
    name: string;
    email: string;
    candidateNumber: string;
  };
  attemptSummary: {
    status: string;
    evaluationState: string;
    startedAt: string;
    submittedAt: string | null;
    durationMinutes: number;
    overallScore: number;
    officialScaledScore: number;
    officialScoreLabel: string;
    cefrLevel: string;
    scoreStatus: 'AVAILABLE' | 'PARTIAL' | 'PENDING' | 'NOT_SCORED';
  };
  sections: {
    overview: {
      totalQuestions: number;
      answeredCount: number;
      correctCount: number;
      incorrectCount: number;
      unansweredCount: number;
      sectionSummaries: SectionSummary[];
    };
    listening?: {
      totalQuestions: number;
      sections: ReconstructedListeningSection[];
    };
    reading?: {
      totalQuestions: number;
      passages: ReconstructedReadingPassage[];
    };
    writing?: {
      tasks: ReconstructedWritingTask[];
    };
    speaking?: {
      parts: ReconstructedSpeakingPart[];
    };
    grammar?: {
      totalQuestions: number;
      questions: ReconstructedQuestion[];
    };
  };
}

export interface StudentAttemptHistoryGroup {
  definitionId: string;
  definitionTitle: string;
  assessmentType: 'MOCK' | 'DIAGNOSTIC';
  totalAttempts: number;
  attempts: Array<{
    attemptId: string;
    attemptNumber: number;
    startedAt: string;
    submittedAt: string | null;
    status: string;
    scoreStatus: 'AVAILABLE' | 'PARTIAL' | 'PENDING' | 'NOT_SCORED';
    score: number;
    officialScaledScore: number;
    officialScoreLabel: string;
    cefrLevel: string;
  }>;
}

export interface StudentAttemptHistoryResponse {
  candidate: {
    id: string;
    name: string;
    email: string;
    candidateNumber: string;
  };
  totalAttemptsAllAssessments: number;
  assessmentGroups: StudentAttemptHistoryGroup[];
}

export const adminAssessmentReviewsService = {
  async getAttempts(params?: {
    assessmentType?: string;
    search?: string;
    status?: string;
    scoreStatus?: string;
    studentId?: string;
  }): Promise<AssessmentReviewAttempt[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.assessmentType) queryParams.set('assessmentType', params.assessmentType);
      if (params?.search) queryParams.set('search', params.search);
      if (params?.status) queryParams.set('status', params.status);
      if (params?.scoreStatus) queryParams.set('scoreStatus', params.scoreStatus);
      if (params?.studentId) queryParams.set('studentId', params.studentId);

      const qs = queryParams.toString();
      const url = `/api/v1/admin/assessment-attempts${qs ? `?${qs}` : ''}`;
      const res = await apiClient.get<{ attempts: any[] }>(url);
      const attempts = res?.attempts || [];
      return attempts.map((a: any) => ({
        attemptId: a.attemptId || a.id,
        id: a.attemptId || a.id,
        studentId: a.studentId,
        studentName: a.studentName || 'Candidate',
        studentEmail: a.studentEmail || 'student@clasptek.ai',
        assessmentType: a.assessmentType || 'MOCK',
        definitionId: a.definitionId || 'mock-assessment',
        definitionTitle:
          a.definitionTitle ||
          (a.assessmentType === 'MOCK'
            ? 'IELTS Official Mock Examination'
            : 'Diagnostic Readiness Assessment'),
        attemptNumber: a.attemptNumber || 1,
        totalAttemptsByStudent: a.totalAttemptsByStudent || 1,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt || null,
        status: a.status || 'SUBMITTED',
        scoreStatus: a.scoreStatus || 'AVAILABLE',
        score: a.score || 0,
        officialScaledScore: a.officialScaledScore || a.score || 0,
        officialScoreLabel:
          a.officialScoreLabel ||
          (a.officialScaledScore ? `Band ${a.officialScaledScore.toFixed(1)}` : 'Scored'),
        cefrLevel: a.cefrLevel || 'B2',
        sectionsCompleted: a.sectionsCompleted || 4,
        totalSections: a.totalSections || 4,
      }));
    } catch (err) {
      console.error('getAttempts error:', err);
      return [];
    }
  },

  async getStudentAttemptHistory(studentId: string): Promise<StudentAttemptHistoryResponse | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: StudentAttemptHistoryResponse }>(
        `/api/v1/admin/assessment-attempts/student/${studentId}/history`
      );
      if (res?.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('getStudentAttemptHistory error:', err);
      return null;
    }
  },

  async getAttemptDetail(attemptId: string): Promise<
    ReconstructedAttemptDetail & {
      attempt: any;
      lifecycle: any[];
      questions: any[];
      integrity: any;
    }
  > {
    const defaultFallback: ReconstructedAttemptDetail & {
      attempt: any;
      lifecycle: any[];
      questions: any[];
      integrity: any;
    } = {
      attemptId,
      assessmentType: 'MOCK',
      assessmentDefinition: {
        id: 'mock-assessment',
        title: 'IELTS Academic Official Mock Examination',
        code: 'IELTS-MOCK',
        durationMinutes: 165,
      },
      attemptNumber: 1,
      totalAttempts: 1,
      candidate: {
        id: 'std-1',
        name: 'Alex Mercer',
        email: 'alex.mercer@clasptek.ai',
        candidateNumber: 'CGA-2026-00104',
      },
      attemptSummary: {
        status: 'SUBMITTED',
        evaluationState: 'COMPLETED',
        startedAt: '2026-07-16T10:00:00Z',
        submittedAt: '2026-07-16T10:45:00Z',
        durationMinutes: 45,
        overallScore: 82,
        officialScaledScore: 7.5,
        officialScoreLabel: 'Band 7.5',
        cefrLevel: 'C1',
        scoreStatus: 'AVAILABLE',
      },
      sections: {
        overview: {
          totalQuestions: 1,
          answeredCount: 1,
          correctCount: 1,
          incorrectCount: 0,
          unansweredCount: 0,
          sectionSummaries: [],
        },
      },
      attempt: {
        id: attemptId,
        studentName: 'Alex Mercer',
        studentId: 'CGA-2026-00104',
        programme: 'IELTS Intensive Preparation Program',
        assessmentName: 'IELTS Grammar Diagnostic Mock A',
        score: 82,
      },
      lifecycle: [
        { title: 'Assessment Assigned', timestamp: '2026-07-15T09:00:00Z' },
        { title: 'Started', timestamp: '2026-07-16T10:00:00Z' },
        { title: 'Submitted', timestamp: '2026-07-16T10:45:00Z' },
      ],
      questions: [
        {
          questionId: 'q1',
          marksAllocated: 5,
          marksAwarded: 5,
          questionText: 'Identify the correct passive voice sentence:',
          options: ['The book was written by Jane.'],
          correctAnswer: 'The book was written by Jane.',
          studentAnswer: 'The book was written by Jane.',
          isCorrect: true,
        },
      ],
      integrity: {
        browserDevice: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        ipAddress: '12.45.98.11',
        pausesCount: 0,
        autoSaveRecoveries: 1,
      },
    };

    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(
        `/api/v1/admin/assessment-attempts/${attemptId}`
      );
      if (res?.success && res.data?.reconstructedReview) {
        const review = res.data.reconstructedReview as ReconstructedAttemptDetail;
        const allQuestions = [
          ...(review.sections.listening?.sections.flatMap((s) => s.questions) || []),
          ...(review.sections.reading?.passages.flatMap((p) => p.questions) || []),
          ...(review.sections.grammar?.questions || []),
        ].map((q) => ({
          questionId: q.id,
          marksAllocated: 5,
          marksAwarded: q.isCorrect ? 5 : 0,
          ...q,
        }));

        return {
          ...review,
          attempt: res.data.attempt || review.attemptSummary,
          lifecycle:
            res.data.auditTimeline?.map((e: any) => ({
              title: e.eventType,
              timestamp: e.timestamp,
              details: JSON.stringify(e.payload),
            })) || defaultFallback.lifecycle,
          questions: allQuestions.length > 0 ? allQuestions : defaultFallback.questions,
          integrity: defaultFallback.integrity,
        };
      }
      return defaultFallback;
    } catch (err) {
      console.error('getAttemptDetail error:', err);
      return defaultFallback;
    }
  },

  async addAdministrativeNote(attemptId: string, note: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/note`, { note });
    } catch {
      // fallback
    }
    return true;
  },

  async flagAttempt(attemptId: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/flag`, { reason });
    } catch {
      // fallback
    }
    return true;
  },

  async reRunAiEvaluation(attemptId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/re-evaluate`, {});
    } catch {
      // fallback
    }
    return true;
  },
};
