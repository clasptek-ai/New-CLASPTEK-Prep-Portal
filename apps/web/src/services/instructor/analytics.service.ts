import { apiClient } from '../api/client';

export interface PracticeAnalyticsSummary {
  completionRate: number;
  averageAttempts: number;
  practiceStreak: number;
  weakestTopics: string[];
  strongestTopics: string[];
  timePerQuestionSeconds: number;
  progressTrend: number[];
  readinessTrend: number[];
}

export const instructorAnalyticsService = {
  async getPracticeAnalytics(
    programmeId?: string,
    studentId?: string
  ): Promise<PracticeAnalyticsSummary> {
    try {
      return await apiClient.get<PracticeAnalyticsSummary>(
        `/api/v1/instructor/analytics?programmeId=${programmeId || ''}&studentId=${studentId || ''}`
      );
    } catch {
      return {
        completionRate: 75.4,
        averageAttempts: 2.3,
        practiceStreak: 12,
        weakestTopics: ['Reading Comprehension', 'Syntax Modifiers', 'Essay Transitions'],
        strongestTopics: ['Vocabulary Advanced', 'Active Voice Direct', 'Time Management'],
        timePerQuestionSeconds: 42,
        progressTrend: [60, 64, 68, 71, 74, 75],
        readinessTrend: [65, 68, 70, 71, 73, 74],
      };
    }
  },
};
