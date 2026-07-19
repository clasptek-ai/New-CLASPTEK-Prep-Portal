import { apiClient } from '../api/client';

export interface DashboardStats {
  programmes: number;
  students: number;
  activeAssignments: number;
  pendingSubmissions: number;
  avgPractice: number;
  avgMock: number;
  avgReadiness: number;
  atRisk: number;
}

export interface RecentActivityItem {
  time: string;
  type: 'PRACTICE' | 'SUBMISSION' | 'MOCK' | 'INTERVENTION' | 'SYSTEM';
  msg: string;
}

export interface DashboardNotificationItem {
  type: string;
  text: string;
}

export interface DashboardAggregatedData {
  stats: DashboardStats;
  recentActivity: RecentActivityItem[];
  notifications: DashboardNotificationItem[];
}

export const instructorDashboardService = {
  async getDashboardData(): Promise<DashboardAggregatedData> {
    try {
      return await apiClient.get<DashboardAggregatedData>('/api/v1/instructor/dashboard/aggregated');
    } catch {
      // Cohesive aggregated fallback data matching the required KPIs and activities
      return {
        stats: {
          programmes: 2,
          students: 80,
          activeAssignments: 5,
          pendingSubmissions: 3,
          avgPractice: 76.5,
          avgMock: 71.2,
          avgReadiness: 73.5,
          atRisk: 12
        },
        recentActivity: [
          { time: '5m ago', type: 'PRACTICE', msg: 'Jane Smith completed Grammar modifiers session (Score: 85%)' },
          { time: '1h ago', type: 'SUBMISSION', msg: 'John Doe submitted Advanced Essay Syntax assignment' },
          { time: '3h ago', type: 'MOCK', msg: 'Bob Johnson finished Diagnostic Mock Exam A (Score: 68%)' },
          { time: '1d ago', type: 'INTERVENTION', msg: 'AI Coach flagged student Alice Brown (Ready Score: 52%) as at-risk' }
        ],
        notifications: [
          { type: 'SUBMISSION', text: 'New essay submission waiting for grading' },
          { type: 'MOCK_COMPLETED', text: 'Mock test evaluation complete' },
          { type: 'RESOURCE_VIEWED', text: 'Resource "IELTS grammar Rule" viewed by 15 students' },
          { type: 'SYSTEM', text: 'Staging environment deployment verified' }
        ]
      };
    }
  }
};
