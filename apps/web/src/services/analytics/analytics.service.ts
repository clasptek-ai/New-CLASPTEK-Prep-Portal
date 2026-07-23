import { apiClient } from '../api/client';

export interface StudentDashboardData {
  studentId: string;
  profileId: string;
  readinessScore: number;
  dailyPlan: {
    totalMinutes: number;
    completedMinutes: number;
  };
  goalCompletion: number;
  studyStreak: number;
  practicePerformance?: {
    correctCount: number;
    totalCount: number;
  };
  assessmentHistory?: any[];
  coachSummary?: {
    lastMessage: string;
  };
  predictionTrend?: number[];
  weakCompetencies?: string[];
  recommendedActions?: string[];
}

export const analyticsService = {
  async getStudentDashboard(studentId: string, profileId: string): Promise<StudentDashboardData> {
    try {
      return await apiClient.get<StudentDashboardData>(
        `/api/v1/analytics/student?studentId=${studentId}&profileId=${profileId}`
      );
    } catch (e) {
      console.warn('analyticsService.getStudentDashboard error, falling back to mock data:', e);
      return {
        studentId,
        profileId,
        readinessScore: 84.5,
        dailyPlan: { totalMinutes: 45, completedMinutes: 30 },
        goalCompletion: 75,
        studyStreak: 5,
        practicePerformance: { correctCount: 15, totalCount: 20 },
        assessmentHistory: [],
        coachSummary: { lastMessage: 'Great progress this week! Focus on vocabulary today.' },
        predictionTrend: [80, 81, 82, 84.5],
        weakCompetencies: ['VOCABULARY_ADVANCED', 'READING_COMPREHENSION'],
        recommendedActions: ['Complete practice task on grammar', 'Read 2 articles from catalog'],
      };
    }
  },

  async getTrends(
    category: string
  ): Promise<{ category: string; trendPoints: Array<{ date: string; value: number }> }> {
    try {
      return await apiClient.get<{
        category: string;
        trendPoints: Array<{ date: string; value: number }>;
      }>(`/api/v1/analytics/trends?category=${category}`);
    } catch (e) {
      console.warn('analyticsService.getTrends error, falling back to mock:', e);
      return {
        category,
        trendPoints: [
          { date: '2026-07-10', value: 30 },
          { date: '2026-07-12', value: 40 },
          { date: '2026-07-15', value: 45 },
        ],
      };
    }
  },
};
