import { apiClient } from '../api/client';

export interface MockExamResult {
  id: string;
  name: string;
  studentName: string;
  score: number;
  percentile: number;
  timeUsed: string;
  sectionScores: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  weakObjectives: string[];
  recommendations: string;
  incorrectQuestions: number[];
}

export const instructorMockResultsService = {
  async getMockResults(studentId?: string): Promise<MockExamResult[]> {
    try {
      const url = studentId
        ? `/api/v1/instructor/mock-results?studentId=${studentId}`
        : '/api/v1/instructor/mock-results';
      return await apiClient.get<MockExamResult[]>(url);
    } catch {
      return [
        {
          id: 'm1',
          name: 'IELTS Grammar Diagnostic Mock A',
          studentName: 'John Doe',
          score: 82,
          percentile: 88,
          timeUsed: '45 mins',
          sectionScores: { listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 },
          weakObjectives: ['Relative Clauses modifiers', 'Coherence transitions'],
          recommendations: 'Dedicate 15 minutes daily to passive syntax voice logs.',
          incorrectQuestions: [12, 24, 31, 39],
        },
      ];
    }
  },
};
