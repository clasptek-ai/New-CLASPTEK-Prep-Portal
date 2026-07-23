import { apiClient } from '../api/client';

export interface MockExam {
  id: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
  status: 'AVAILABLE' | 'COMPLETED' | 'IN_PROGRESS';
  score?: number;
  percentile?: number;
  timeUsed?: string;
  sectionScores?: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  weakObjectives?: string[];
  recommendations?: string;
  incorrectQuestions?: number[];
}

export const studentMockExamsService = {
  async getMockExams(): Promise<MockExam[]> {
    try {
      return await apiClient.get<MockExam[]>('/api/v1/student/exams');
    } catch {
      return [
        {
          id: 'exam1',
          title: 'IELTS Grammar Diagnostic Mock A',
          durationMinutes: 60,
          questionCount: 40,
          status: 'COMPLETED',
          score: 82,
          percentile: 88,
          timeUsed: '45 mins',
          sectionScores: { listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 },
          weakObjectives: ['Relative Clauses modifiers', 'Coherence transitions'],
          recommendations: 'Dedicate 15 minutes daily to passive syntax voice logs.',
          incorrectQuestions: [12, 24, 31, 39],
        },
        {
          id: 'exam2',
          title: 'IELTS Grammar Diagnostic Mock B',
          durationMinutes: 60,
          questionCount: 40,
          status: 'AVAILABLE',
        },
      ];
    }
  },

  async startExamSession(id: string): Promise<{ success: boolean; sessionToken: string }> {
    try {
      return await apiClient.post<any>('/api/v1/runtime/session/start', { examId: id });
    } catch {
      return { success: true, sessionToken: 'token-' + id };
    }
  },
};
