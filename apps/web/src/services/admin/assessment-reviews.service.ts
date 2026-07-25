import { apiClient } from '../api/client';

export interface AssessmentReviewAttempt {
  id: string;
  studentName: string;
  studentId: string;
  programme: string;
  assessmentName: string;
  assessmentType: 'MOCK' | 'PRACTICE';
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  score: number;
  readinessScore: number;
  aiEvaluationStatus: 'COMPLETED' | 'PENDING';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'FLAGGED';
}

export interface ReviewQuestionItem {
  questionId: string;
  questionType: 'MCQ' | 'ESSAY' | 'SPEAKING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  learningObjective: string;
  marksAllocated: number;
  marksAwarded: number;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  essayWriting?: {
    submissionText: string;
    aiBandScore: number;
    rubricCoherenceScore: number;
    grammarFeedback: string;
    vocabularyFeedback: string;
    taskAchievementFeedback: string;
  };
}

export interface AttemptLifecycleEvent {
  title: string;
  timestamp: string;
  details?: string;
}

export interface CandidateHistorySummary {
  attemptId: string;
  score: number;
  date: string;
}

export interface CandidateReviewDetail {
  attempt: AssessmentReviewAttempt;
  lifecycle: AttemptLifecycleEvent[];
  questions: ReviewQuestionItem[];
  history: CandidateHistorySummary[];
  integrity: {
    browserDevice: string;
    ipAddress: string;
    pausesCount: number;
    autoSaveRecoveries: number;
  };
}

const STORAGE_KEY = 'clasptek_attempts';

const DEFAULT_ATTEMPTS: CandidateReviewDetail[] = [
  {
    attempt: {
      id: 'att1',
      studentName: 'Alex Mercer',
      studentId: 'CGA-2026-00104',
      programme: 'IELTS Intensive Preparation Program',
      assessmentName: 'IELTS Grammar Diagnostic Mock A',
      assessmentType: 'MOCK',
      startedAt: '2026-07-16T10:00:00Z',
      submittedAt: '2026-07-16T10:45:00Z',
      durationSeconds: 2700,
      score: 82,
      readinessScore: 76,
      aiEvaluationStatus: 'COMPLETED',
      status: 'SUBMITTED',
    },
    lifecycle: [
      { title: 'Assessment Assigned', timestamp: '2026-07-15T09:00:00Z' },
      { title: 'Started', timestamp: '2026-07-16T10:00:00Z' },
      { title: 'Submitted', timestamp: '2026-07-16T10:45:00Z' },
    ],
    questions: [
      {
        questionId: 'q1',
        questionType: 'MCQ',
        difficulty: 'MEDIUM',
        topic: 'Passive Voice Constraints',
        learningObjective: 'Identify the correct passive voice sentence structure',
        marksAllocated: 5,
        marksAwarded: 5,
        questionText: 'Identify the correct passive voice sentence:',
        options: [
          'The book was written by Jane.',
          'Jane wrote the book.',
          'The book has written Jane.',
          'Jane has written the book.',
        ],
        correctAnswer: 'The book was written by Jane.',
        studentAnswer: 'The book was written by Jane.',
        isCorrect: true,
        explanation: 'Passive voice shifts focus to the receiver of the action.',
      },
      {
        questionId: 'q2',
        questionType: 'ESSAY',
        difficulty: 'HARD',
        topic: 'Argumentative Writing Structure',
        learningObjective: 'Write a cohesive argument utilizing modifiers syntax',
        marksAllocated: 20,
        marksAwarded: 16,
        questionText: 'Write a 250-word essay about AI tutor diagnostics integration.',
        correctAnswer: 'Syntactically accurate essay with band 8.0 cohesion rules.',
        studentAnswer:
          'In modern education systems, AI diagnostics assist students by scanning weak objectives...',
        isCorrect: true,
        explanation: 'Demonstrated strong cohesion and task achievement.',
      },
    ],
    history: [{ attemptId: 'att0', score: 58, date: '2026-06-10T11:00:00Z' }],
    integrity: {
      browserDevice: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      ipAddress: '12.45.98.11',
      pausesCount: 0,
      autoSaveRecoveries: 1,
    },
  },
];

function getStoredDetails(): CandidateReviewDetail[] {
  if (typeof window === 'undefined') return DEFAULT_ATTEMPTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ATTEMPTS));
    return DEFAULT_ATTEMPTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ATTEMPTS;
  }
}

function saveStoredDetails(list: CandidateReviewDetail[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export const adminAssessmentReviewsService = {
  async getAttempts(): Promise<AssessmentReviewAttempt[]> {
    try {
      const data = await apiClient.get<AssessmentReviewAttempt[]>('/api/v1/admin/attempts');
      if (data && data.length > 0) return data;
      return getStoredDetails().map((d) => d.attempt);
    } catch {
      return getStoredDetails().map((d) => d.attempt);
    }
  },

  async getAttemptDetail(attemptId: string): Promise<CandidateReviewDetail> {
    const list = getStoredDetails();
    const found = list.find((d) => d.attempt.id === attemptId);
    if (found) return found;

    try {
      return await apiClient.get<CandidateReviewDetail>(`/api/v1/admin/attempts/${attemptId}`);
    } catch {
      return DEFAULT_ATTEMPTS[0];
    }
  },

  async recordStudentAttempt(detail: CandidateReviewDetail): Promise<boolean> {
    const list = getStoredDetails();
    saveStoredDetails([detail, ...list]);
    return true;
  },

  async addAdministrativeNote(attemptId: string, note: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/note`, { note });
    } catch {
      // client-side fallback
    }
    return true;
  },

  async flagAttempt(attemptId: string, reason: string): Promise<boolean> {
    const list = getStoredDetails();
    const updated = list.map((d) =>
      d.attempt.id === attemptId
        ? { ...d, attempt: { ...d.attempt, status: 'FLAGGED' as const } }
        : d
    );
    saveStoredDetails(updated);
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
