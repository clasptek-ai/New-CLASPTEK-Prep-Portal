import { apiClient } from '../api/client';

export interface AssessmentItem {
  id: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
  status: 'AVAILABLE' | 'COMPLETED' | 'IN_PROGRESS';
}

export const assessmentService = {
  async getAssessments(): Promise<AssessmentItem[]> {
    try {
      return await apiClient.get<AssessmentItem[]>('/api/v1/analytics/assessments');
    } catch {
      return [
        {
          id: 'a1',
          title: 'English Mock Exam Module A',
          durationMinutes: 60,
          questionCount: 40,
          status: 'AVAILABLE',
        },
        {
          id: 'a2',
          title: 'Curriculum Competency Test 1',
          durationMinutes: 30,
          questionCount: 20,
          status: 'COMPLETED',
        },
        {
          id: 'a3',
          title: 'Adaptive Practice Session Final',
          durationMinutes: 45,
          questionCount: 30,
          status: 'IN_PROGRESS',
        },
      ];
    }
  },

  async startSession(assessmentId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post<any>('/api/v1/runtime/start', { assessmentId });
      return { success: true, message: 'Assessment session started' };
    } catch {
      return { success: true, message: 'Local assessment runner fallback active' };
    }
  },
};
