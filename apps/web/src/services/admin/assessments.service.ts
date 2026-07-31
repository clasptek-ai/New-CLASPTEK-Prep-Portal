import { apiClient } from '../api/client';

export interface AdminAssessmentConfig {
  id: string;
  title: string;
  type: 'DIAGNOSTIC' | 'PRACTICE' | 'MOCK';
  examType?: string;
  durationMinutes: number;
  questionCount: number;
  availableFrom?: string;
  availableUntil?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export const adminAssessmentsService = {
  async getAssessments(): Promise<AdminAssessmentConfig[]> {
    try {
      const res = await apiClient.get<any>('/api/v1/admin/assessments');
      const data =
        res && res.success && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      return data;
    } catch {
      return [];
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
      return false;
    }
  },

  async publishAssessment(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/assessments/${id}/publish`, {});
      return true;
    } catch {
      return false;
    }
  },

  async createAssessment(config: AdminAssessmentConfig): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/admin/assessments', config);
      return true;
    } catch {
      return false;
    }
  },
};
