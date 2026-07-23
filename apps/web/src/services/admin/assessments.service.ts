import { apiClient } from '../api/client';

export interface AdminAssessmentConfig {
  id: string;
  title: string;
  type: 'MOCK' | 'PRACTICE';
  durationMinutes: number;
  questionCount: number;
  availableFrom?: string;
  availableUntil?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export const adminAssessmentsService = {
  async getAssessments(): Promise<AdminAssessmentConfig[]> {
    try {
      return await apiClient.get<AdminAssessmentConfig[]>('/api/v1/admin/assessments');
    } catch {
      return [
        {
          id: 'exam1',
          title: 'IELTS Grammar Diagnostic Mock A',
          type: 'MOCK',
          durationMinutes: 60,
          questionCount: 40,
          availableFrom: '2026-07-01T00:00:00Z',
          availableUntil: '2026-12-31T23:59:59Z',
          status: 'PUBLISHED',
        },
        {
          id: 'exam2',
          title: 'IELTS Grammar Diagnostic Mock B',
          type: 'MOCK',
          durationMinutes: 60,
          questionCount: 40,
          status: 'DRAFT',
        },
      ];
    }
  },

  async scheduleAssessment(id: string, fromDate: string, untilDate: string): Promise<boolean> {
    try {
      await apiClient.patch(`/api/v1/admin/assessments/${id}/schedule`, {
        availableFrom: fromDate,
        availableUntil: untilDate,
      });
      return true;
    } catch {
      return true;
    }
  },

  async publishAssessment(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/assessments/${id}/publish`, {});
      return true;
    } catch {
      return true;
    }
  },
};
