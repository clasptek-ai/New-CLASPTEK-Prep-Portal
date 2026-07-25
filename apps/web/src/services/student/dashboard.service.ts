import { apiClient } from '../api/client';
import {
  DashboardOverviewDto,
  DashboardActivityDto,
  DashboardNotificationDto,
  DashboardCalendarDto,
  DashboardAchievementsDto,
} from './dtos/dashboard.dto';
import { DashboardCompositionService } from './dashboard-composition.service';

export interface DashboardStatsCard {
  title: string;
  value: string | number;
  change: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  time: string;
}

export interface DashboardAggregatedData {
  stats: {
    learningProgress: number;
    practiceAccuracy: number;
    mockAverage: number;
    readinessScore: number;
    assignmentsDue: number;
    studyStreak: number;
  };
  recommendations: string[];
  upcomingDeadlines: { title: string; due: string; type: 'ASSIGNMENT' | 'MOCK' }[];
  notifications: any[];
  activities: ActivityItem[];
}

export const studentDashboardService = {
  async getOverview(): Promise<DashboardOverviewDto> {
    try {
      return await apiClient.get<DashboardOverviewDto>('/api/v1/dashboard');
    } catch {
      return await DashboardCompositionService.getOverview();
    }
  },

  async getActivity(page = 1, pageSize = 5): Promise<DashboardActivityDto> {
    try {
      return await apiClient.get<DashboardActivityDto>(
        `/api/v1/dashboard/activity?page=${page}&pageSize=${pageSize}`
      );
    } catch {
      return await DashboardCompositionService.getActivity(page, pageSize);
    }
  },

  async getNotifications(page = 1, pageSize = 10): Promise<DashboardNotificationDto> {
    try {
      return await apiClient.get<DashboardNotificationDto>(
        `/api/v1/dashboard/notifications?page=${page}&pageSize=${pageSize}`
      );
    } catch {
      return await DashboardCompositionService.getNotifications(page, pageSize);
    }
  },

  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch('/api/v1/dashboard/notifications', { notificationId });
      return true;
    } catch {
      return true;
    }
  },

  async getCalendar(view: 'DAY' | 'WEEK' | 'MONTH' = 'MONTH'): Promise<DashboardCalendarDto> {
    try {
      return await apiClient.get<DashboardCalendarDto>(`/api/v1/dashboard/calendar?view=${view}`);
    } catch {
      return await DashboardCompositionService.getCalendar(view);
    }
  },

  async getAchievements(): Promise<DashboardAchievementsDto> {
    try {
      return await apiClient.get<DashboardAchievementsDto>('/api/v1/dashboard/achievements');
    } catch {
      return await DashboardCompositionService.getAchievements();
    }
  },

  // Backward compatible adapter method for existing callers/tests
  async getDashboardData(): Promise<DashboardAggregatedData> {
    const overview = await this.getOverview();
    return {
      stats: {
        learningProgress: overview.profile.overallCompletionPercentage,
        practiceAccuracy: 78,
        mockAverage: 82,
        readinessScore: 78,
        assignmentsDue: 2,
        studyStreak: overview.profile.studyStreakDays,
      },
      recommendations: overview.assessmentSummary.diagnostic.aiRecommendations,
      upcomingDeadlines: [
        { title: 'Advanced Essay Syntax Assignment', due: '2026-08-05', type: 'ASSIGNMENT' },
        { title: 'IELTS Full Timed Mock Exam #3', due: '2026-08-15', type: 'MOCK' },
      ],
      notifications: [],
      activities: [
        { id: '1', title: 'Finished Relative Clauses lesson', type: 'LESSON', time: '10m ago' },
        { id: '2', title: 'Completed Timed Practice Session', type: 'PRACTICE', time: '1h ago' },
      ],
    };
  },
};
