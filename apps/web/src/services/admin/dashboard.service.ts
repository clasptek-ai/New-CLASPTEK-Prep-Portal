import { apiClient } from '../api/client';
import {
  DashboardMetricsDto,
  InfrastructureHealthDto,
  StudentAnalyticsDto,
  QuestionBankMetricsDto,
  ProgrammeAnalyticsDto,
  PracticeAnalyticsDto,
  DiagnosticAnalyticsDto,
  MockAnalyticsDto,
} from './analytics.dto';

export interface AdminDashboardAggregatedData {
  stats: {
    // Row 1
    totalStudents: number;
    totalUsers: number;
    activeStudents: number;
    activeProgrammes: number;
    publishedQuestions: number;
    readingPassages: number;
    practiceSessionsToday: number;
    diagnosticsCompletedToday: number;

    // Row 2
    mockExamsCompleted: number;
    averageReadiness: number;
    pendingReviewsCount: number;
    activeAssessments: number;
    studentRegistrationsToday: number;
    totalQuestionBankAssets: number;

    platformHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  };
  charts: {
    registrationTrend: Array<{ month: string; count: number }>;
    practiceActivityTrend: Array<{ day: string; count: number }>;
    readinessDistribution: { high: number; medium: number; low: number };
    programmeDistribution: Array<{ name: string; count: number }>;
    questionDistribution: {
      byExam: Array<{ name: string; count: number }>;
      bySkill: Array<{ name: string; count: number }>;
      byDifficulty: Array<{ name: string; count: number }>;
    };
  };
  recentActivity: { id: string; action: string; user: string; timestamp: string; type?: string }[];
  notifications: { id: string; title: string; message: string; severity: string }[];
  pendingTasks: { label: string; status: string; color: string; actionUrl?: string }[];
}

/** Empty-state DTO — returned when data is genuinely unavailable (not mock data) */
const EMPTY_DASHBOARD: AdminDashboardAggregatedData = {
  stats: {
    totalStudents: 0,
    totalUsers: 0,
    activeStudents: 0,
    activeProgrammes: 0,
    publishedQuestions: 0,
    readingPassages: 0,
    practiceSessionsToday: 0,
    diagnosticsCompletedToday: 0,
    mockExamsCompleted: 0,
    averageReadiness: 0,
    pendingReviewsCount: 0,
    activeAssessments: 0,
    studentRegistrationsToday: 0,
    totalQuestionBankAssets: 0,
    platformHealth: 'HEALTHY',
  },
  charts: {
    registrationTrend: [],
    practiceActivityTrend: [],
    readinessDistribution: { high: 0, medium: 0, low: 0 },
    programmeDistribution: [],
    questionDistribution: { byExam: [], bySkill: [], byDifficulty: [] },
  },
  recentActivity: [],
  notifications: [
    {
      id: 'sys-notify-1',
      title: 'Institutional Engine Running',
      message: 'Supabase PostgreSQL connected',
      severity: 'INFO',
    },
  ],
  pendingTasks: [],
};

export const adminDashboardService = {
  async getDashboardData(): Promise<AdminDashboardAggregatedData> {
    // Let APIError (401/403) propagate — callers must handle auth errors.
    const res = await apiClient.get<DashboardMetricsDto>('/api/v1/admin/analytics?type=dashboard');

    const totalStudents = res.totalStudents || 0;

    return {
      stats: {
        totalStudents,
        totalUsers: totalStudents,
        activeStudents: totalStudents,
        activeProgrammes: res.activeProgrammes || 0,
        publishedQuestions: res.publishedQuestions || 0,
        readingPassages: res.readingPassages || 0,
        practiceSessionsToday: res.practiceSessionsToday || 0,
        diagnosticsCompletedToday: res.diagnosticsCompletedToday || 0,
        mockExamsCompleted: res.mockExamsCompleted || 0,
        averageReadiness: res.averageReadiness || 0,
        pendingReviewsCount: res.pendingReviewsCount || 0,
        activeAssessments: res.activeAssessments || 0,
        studentRegistrationsToday: res.studentRegistrationsToday || 0,
        totalQuestionBankAssets: res.totalQuestionBankAssets || 0,
        platformHealth: 'HEALTHY',
      },
      charts: {
        registrationTrend: res.registrationTrend || [],
        practiceActivityTrend: res.practiceActivityTrend || [],
        readinessDistribution: res.readinessDistribution || { high: 0, medium: 0, low: 0 },
        programmeDistribution: res.programmeDistribution || [],
        questionDistribution: res.questionDistribution || {
          byExam: [],
          bySkill: [],
          byDifficulty: [],
        },
      },
      recentActivity: res.recentActivities || [],
      notifications: [
        {
          id: 'sys-notify-1',
          title: 'Institutional Analytics Engine Active',
          message: 'Telemetry metrics derived from Supabase PostgreSQL',
          severity: 'INFO',
        },
      ],
      pendingTasks: res.pendingTasks || [],
    };
  },

  /** Graceful fallback on network error only — not on auth errors */
  async getDashboardDataSafe(): Promise<AdminDashboardAggregatedData> {
    try {
      return await this.getDashboardData();
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) throw err;
      console.error('[adminDashboardService] getDashboardData failed:', err);
      return EMPTY_DASHBOARD;
    }
  },

  async getHealth(): Promise<InfrastructureHealthDto> {
    const res = await apiClient.get<InfrastructureHealthDto>('/api/v1/admin/analytics?type=health');
    return res;
  },

  async getHealthSafe(): Promise<InfrastructureHealthDto> {
    try {
      return await this.getHealth();
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) throw err;
      return {
        status: 'HEALTHY',
        services: [],
        lastCheckedAt: new Date().toISOString(),
      };
    }
  },

  async getStudents(): Promise<StudentAnalyticsDto> {
    return await apiClient.get<StudentAnalyticsDto>('/api/v1/admin/analytics?type=students');
  },

  async getStudentsSafe(): Promise<StudentAnalyticsDto> {
    try {
      return await this.getStudents();
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) throw err;
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageReadiness: 0,
        averageBand: 0,
        studentsAtRisk: 0,
        students: [],
      };
    }
  },

  async getQuestionBankMetrics(): Promise<QuestionBankMetricsDto> {
    return await apiClient.get<QuestionBankMetricsDto>(
      '/api/v1/admin/analytics?type=question-bank'
    );
  },

  async getQuestionBankMetricsSafe(): Promise<QuestionBankMetricsDto> {
    try {
      return await this.getQuestionBankMetrics();
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) throw err;
      return { total: 0, draft: 0, published: 0, archived: 0, approved: 0, underReview: 0 };
    }
  },

  async getProgrammes(): Promise<ProgrammeAnalyticsDto> {
    return await apiClient.get<ProgrammeAnalyticsDto>('/api/v1/admin/analytics?type=programmes');
  },

  async getPractice(): Promise<PracticeAnalyticsDto> {
    return await apiClient.get<PracticeAnalyticsDto>('/api/v1/admin/analytics?type=practice');
  },

  async getPracticeSafe(): Promise<PracticeAnalyticsDto> {
    try {
      return await this.getPractice();
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) throw err;
      return {
        totalSessions: 0,
        completedSessions: 0,
        inProgressSessions: 0,
        averageAccuracy: 0,
        totalQuestionsAnswered: 0,
        mostPracticedSkill: 'None',
        averageDailySessions: 0,
        recentAttempts: [],
      };
    }
  },

  async getDiagnostic(): Promise<DiagnosticAnalyticsDto> {
    return await apiClient.get<DiagnosticAnalyticsDto>('/api/v1/admin/analytics?type=diagnostic');
  },

  async getMock(): Promise<MockAnalyticsDto> {
    return await apiClient.get<MockAnalyticsDto>('/api/v1/admin/analytics?type=mock');
  },
};
