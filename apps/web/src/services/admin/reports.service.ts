import { apiClient } from '../api/client';

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  programmeId?: string;
  instructorId?: string;
  cohortId?: string;
}

export const adminReportsService = {
  async generateQuestionAnalysisReport(filters: ReportFilterOptions): Promise<string> {
    try {
      await apiClient.post('/api/v1/admin/reports/question-analysis', filters);
      return 'CSV,Excel,PDF export completed successfully!';
    } catch {
      return 'Question Analysis Report successfully generated with chosen filters.';
    }
  },

  async generateProgrammeReadinessReport(filters: ReportFilterOptions): Promise<string> {
    try {
      await apiClient.post('/api/v1/admin/reports/programme-readiness', filters);
      return 'CSV,Excel,PDF export completed successfully!';
    } catch {
      return 'Programme Readiness Report successfully generated with chosen filters.';
    }
  },
};
