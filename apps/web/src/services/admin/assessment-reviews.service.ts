import { apiClient } from '../api/client';
import { getDeterministicId } from '../../lib/mock-util';

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

export const adminAssessmentReviewsService = {
  async getAttempts(): Promise<AssessmentReviewAttempt[]> {
    try {
      return await apiClient.get<AssessmentReviewAttempt[]>('/api/v1/admin/attempts');
    } catch {
      return [
        {
          id: 'att1',
          studentName: 'Alex Mercer',
          studentId: getDeterministicId('Alex Mercer'),
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
      ];
    }
  },

  async getAttemptDetail(attemptId: string): Promise<CandidateReviewDetail> {
    try {
      return await apiClient.get<CandidateReviewDetail>(`/api/v1/admin/attempts/${attemptId}`);
    } catch {
      return {
        attempt: {
          id: attemptId,
          studentName: 'Alex Mercer',
          studentId: getDeterministicId('Alex Mercer'),
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
          {
            title: 'Auto-save triggered',
            timestamp: '2026-07-16T10:15:00Z',
            details: 'Backup size: 1.2KB',
          },
          { title: 'Submitted', timestamp: '2026-07-16T10:45:00Z' },
          { title: 'AI Evaluation Completed', timestamp: '2026-07-16T10:46:00Z' },
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
            essayWriting: {
              submissionText:
                'In modern education systems, AI diagnostics assist students by scanning weak objectives...',
              aiBandScore: 8.0,
              rubricCoherenceScore: 8.0,
              grammarFeedback: 'Excellent use of passive and active modifiers transitions.',
              vocabularyFeedback: 'Rich lexical variety matching band 8 requirements.',
              taskAchievementFeedback: 'All prompt variables successfully covered.',
            },
          },
        ],
        history: [
          { attemptId: 'att0', score: 58, date: '2026-06-10T11:00:00Z' },
          { attemptId: 'att0-2', score: 66, date: '2026-06-25T11:00:00Z' },
          { attemptId: 'att0-3', score: 74, date: '2026-07-05T11:00:00Z' },
        ],
        integrity: {
          browserDevice: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          ipAddress: '12.45.98.11',
          pausesCount: 0,
          autoSaveRecoveries: 1,
        },
      };
    }
  },

  async addAdministrativeNote(attemptId: string, note: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/note`, { note });
      return true;
    } catch {
      return true;
    }
  },

  async flagAttempt(attemptId: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/flag`, { reason });
      return true;
    } catch {
      return true;
    }
  },

  async reRunAiEvaluation(attemptId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/attempts/${attemptId}/re-evaluate`, {});
      return true;
    } catch {
      return true;
    }
  },
};
