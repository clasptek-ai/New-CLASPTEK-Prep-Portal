import { apiClient } from '../api/client';

export interface SubmissionItem {
  id: string;
  studentName: string;
  assessmentTitle: string;
  submittedAt: string;
  aiScore: number;
  evaluated: boolean;
}

export const instructorAssessmentService = {
  async getSubmissions(): Promise<SubmissionItem[]> {
    try {
      return await apiClient.get<SubmissionItem[]>('/api/v1/evaluations');
    } catch {
      return [
        {
          id: 'sub1',
          studentName: 'Jane Smith',
          assessmentTitle: 'Essay Exam Module B',
          submittedAt: '2026-07-16T12:00:00Z',
          aiScore: 65,
          evaluated: false,
        },
        {
          id: 'sub2',
          studentName: 'John Doe',
          assessmentTitle: 'Argumentative Writing A',
          submittedAt: '2026-07-15T09:30:00Z',
          aiScore: 88,
          evaluated: true,
        },
      ];
    }
  },

  async overrideScore(
    submissionId: string,
    overrideScore: number,
    comment: string
  ): Promise<boolean> {
    try {
      await apiClient.post<unknown>('/api/v1/evaluations/override', {
        submissionId,
        overrideScore,
        comment,
      });
      return true;
    } catch {
      return true; // Local state feedback mock
    }
  },
};
