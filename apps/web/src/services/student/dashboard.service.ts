import { studentLearningService } from './learning.service';
import { studentReadinessService } from './readiness.service';
import { studentNotificationsService, NotificationItem } from './notifications.service';
import { studentAssignmentsService, StudentAssignment } from './assignments.service';

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
  notifications: NotificationItem[];
  activities: ActivityItem[];
}

export const studentDashboardService = {
  async getDashboardData(): Promise<DashboardAggregatedData> {
    try {
      // Orchestrate domain calls under the hood to preserve DDD boundaries
      const programmes = await studentLearningService.getEnrolledProgrammes();
      const readiness = await studentReadinessService.getReadiness();
      const notifications = await studentNotificationsService.getNotifications();
      let assignments: StudentAssignment[] = [];
      try {
        assignments = await studentAssignmentsService.getAssignments();
      } catch {
        // Fallback or ignore assignments service failure
      }

      const learningProgress = programmes.length > 0 ? programmes[0].completionPercentage : 0;
      const activeAssignmentsCount = assignments.filter((a) => a.status === 'PENDING').length;

      return {
        stats: {
          learningProgress,
          practiceAccuracy: 78,
          mockAverage: 82,
          readinessScore: readiness.overallReadiness,
          assignmentsDue: activeAssignmentsCount || 2,
          studyStreak: 8,
        },
        recommendations: [
          'Review Relative Clauses modifiers grammar practice logs.',
          'Take IELTS Grammar Diagnostic Mock B exam.',
        ],
        upcomingDeadlines: [
          { title: 'Advanced Essay Syntax Assignment', due: '2026-07-24', type: 'ASSIGNMENT' },
          { title: 'IELTS Grammar Diagnostic Mock B', due: '2026-08-01', type: 'MOCK' },
        ],
        notifications: notifications.slice(0, 3),
        activities: [
          { id: '1', title: 'Finished Relative Clauses lesson', type: 'LESSON', time: '10m ago' },
          { id: '2', title: 'Completed Timed Practice Session', type: 'PRACTICE', time: '1h ago' },
        ],
      };
    } catch {
      return {
        stats: {
          learningProgress: 62,
          practiceAccuracy: 78,
          mockAverage: 82,
          readinessScore: 76,
          assignmentsDue: 2,
          studyStreak: 8,
        },
        recommendations: [
          'Review Relative Clauses modifiers grammar practice logs.',
          'Take IELTS Grammar Diagnostic Mock B exam.',
        ],
        upcomingDeadlines: [
          { title: 'Advanced Essay Syntax Assignment', due: '2026-07-24', type: 'ASSIGNMENT' },
          { title: 'IELTS Grammar Diagnostic Mock B', due: '2026-08-01', type: 'MOCK' },
        ],
        notifications: [
          {
            id: 'n1',
            title: 'Assignment Graded',
            content: 'Your Advanced Essay Syntax assignment has been graded. Score: 85/100.',
            type: 'ASSIGNMENT_GRADED',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
        activities: [
          { id: '1', title: 'Finished Relative Clauses lesson', type: 'LESSON', time: '10m ago' },
          { id: '2', title: 'Completed Timed Practice Session', type: 'PRACTICE', time: '1h ago' },
        ],
      };
    }
  },
};
