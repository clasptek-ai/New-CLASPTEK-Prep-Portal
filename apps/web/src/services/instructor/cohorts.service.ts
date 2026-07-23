import { apiClient } from '../api/client';

export interface CohortItem {
  id: string;
  name: string;
  enrolledStudentsCount: number;
  averageReadiness: number;
  completionRate: number;
  atRiskCount: number;
}

export const instructorCohortsService = {
  async getCohorts(): Promise<CohortItem[]> {
    try {
      return await apiClient.get<CohortItem[]>('/api/v1/cohorts');
    } catch {
      return [
        {
          id: 'c1',
          name: 'English Class A',
          enrolledStudentsCount: 25,
          averageReadiness: 78.4,
          completionRate: 85,
          atRiskCount: 2,
        },
        {
          id: 'c2',
          name: 'Pre-University Diagnostics',
          enrolledStudentsCount: 40,
          averageReadiness: 62.1,
          completionRate: 50,
          atRiskCount: 9,
        },
        {
          id: 'c3',
          name: 'IELTS Intensive Review',
          enrolledStudentsCount: 15,
          averageReadiness: 81.2,
          completionRate: 90,
          atRiskCount: 1,
        },
      ];
    }
  },
};
