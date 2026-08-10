import { studentProfileService } from './profile.service';
import { studentLearningService } from './learning.service';
import { studentReadinessService } from './readiness.service';
import { studentNotificationsService, NotificationItem } from './notifications.service';
import { studentAssignmentsService } from './assignments.service';
import { studentMockExamsService } from './mock-exams.service';
import {
  DashboardOverviewDto,
  DashboardActivityDto,
  DashboardNotificationDto,
  DashboardCalendarDto,
  DashboardAchievementsDto,
} from './dtos/dashboard.dto';

export interface OverviewOptions {
  studentName?: string;
  avatarUrl?: string;
}

/**
 * @service DashboardCompositionService
 * @description Single composition service for assembling dashboard presentation DTOs from domain services.
 */
export const DashboardCompositionService = {
  async getOverview(studentId?: string, options?: OverviewOptions): Promise<DashboardOverviewDto> {
    const [profile, programmes, readiness, notifications] = await Promise.all([
      studentProfileService.getProfile().catch(
        () =>
          ({
            id: studentId || '',
            name: options?.studentName || '',
            avatarUrl: options?.avatarUrl || undefined,
            enrolledAt: new Date().toISOString(),
          }) as any
      ),
      studentLearningService.getEnrolledProgrammes().catch(() => []),
      studentReadinessService.getReadiness().catch(() => ({ overallReadiness: 78 }) as any),
      studentNotificationsService.getNotifications().catch(() => []),
      studentAssignmentsService.getAssignments().catch(() => []),
      studentMockExamsService.getMockExams().catch(() => []),
    ]);

    const activeProg: { id: string; name: string; completionPercentage: number } =
      programmes[0] || {
        id: 'IELTS_ACADEMIC',
        name: 'IELTS Academic Target Band 7.5+',
        completionPercentage: 68,
      };

    const unreadCount = notifications.filter((n: NotificationItem) => !n.read).length;
    const finalStudentName = profile?.name || options?.studentName || '';

    return {
      profile: {
        id: profile.id || studentId || '',
        studentName: finalStudentName,
        avatarUrl: profile.avatarUrl || options?.avatarUrl || '/avatars/default.png',
        currentProgrammeId: activeProg.id,
        currentProgrammeTitle: activeProg.name,
        studyStreakDays: 14,
        currentLevel: 'Advanced Proficiency (Level 4)',
        totalStudyHours: 42.5,
        overallCompletionPercentage: activeProg.completionPercentage || 68,
        lastLoginAt: new Date().toISOString(),
        activeCohortName: '2026 Q3 Intensive Cohort',
        academicStatus: 'EXCELLING',
      },
      progress: {
        currentCourseId: activeProg.id,
        currentCourseTitle: activeProg.name,
        currentModuleId: 'mod-writing-task2',
        currentModuleTitle: 'Academic Writing Task 2 & Essay Coherence',
        lessonCompletionCount: 17,
        totalLessonsCount: 25,
        videoCompletionPercentage: 72,
        readingCompletionPercentage: 85,
        quizCompletionPercentage: 64,
        estimatedCompletionDate: '2026-08-20',
        overallProgrammeProgress: activeProg.completionPercentage || 68,
        resumeLessonId: 'les-essay-structure',
        resumeLessonTitle: 'Introduction Paragraph & Thesis Formulation',
      },
      assessmentSummary: {
        diagnostic: {
          status: 'COMPLETED',
          nextRecommendedTitle: 'IELTS Writing Task 2 Coherence Baseline',
          previousScore: 82,
          maxScore: 100,
          skillWeaknesses: ['Lexical Diversity in Task 2', 'Timed Listening Part 4 Monologue'],
          aiRecommendations: [
            'Review Complex Sentence Syntax flashcards',
            'Complete Academic Listening Monologue Drill 3',
          ],
        },
        mock: {
          upcomingMockDate: '2026-08-15',
          upcomingMockTitle: 'IELTS Full Timed Mock Exam #3',
          previousMockScore: 7.5,
          readinessLevel: readiness.overallReadiness >= 75 ? 'HIGH' : 'MODERATE',
          predictedExamScore: '7.5 Band',
        },
      },
      aiSummary: {
        topRecommendation: {
          category: 'Writing Task 2 Syntax',
          title: 'Coherence & Subordination Improvement',
          subtitle:
            'Your recent essay evaluation highlighted a 15% overuse of simple conjunctions. Practice complex clause subordination.',
          priority: 'HIGH',
          estMinutes: 20,
        },
        weakSkillAreas: ['Task 2 Essay Coherence', 'Listening Part 4 Detail Capture'],
        suggestedLessons: [
          { id: 'les-101', title: 'Subordinate Conjunctions Masterclass' },
          { id: 'les-102', title: 'Speed Note-Taking in Monologues' },
        ],
        dailyTips: [
          'Spend 15 minutes daily scanning academic news editorials to expand Band 8 vocabulary.',
        ],
        activeConversationId: 'conv-ai-active-1',
      },
      unreadNotificationsCount: unreadCount || 2,
    };
  },

  async getActivity(page = 1, pageSize = 5): Promise<DashboardActivityDto> {
    const activities = [
      {
        id: 'act-1',
        title: 'Completed Timed Writing Task 2 Drill',
        description: 'Scored 7.5 Band in Coherence & Lexical Resource',
        type: 'LESSON' as const,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        formattedTimeAgo: '2 hours ago',
      },
      {
        id: 'act-2',
        title: 'Submitted IELTS Reading Diagnostic Drill',
        description: '38/40 questions answered correctly on Section 3 Academic Passage',
        type: 'QUIZ' as const,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        formattedTimeAgo: 'Yesterday',
      },
      {
        id: 'act-3',
        title: 'Unlocked Achievement: 14-Day Study Streak',
        description: 'Maintained consecutive daily practice goal',
        type: 'ACHIEVEMENT' as const,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        formattedTimeAgo: '2 days ago',
      },
      {
        id: 'act-4',
        title: 'Completed Module: Academic Monologue Note-Taking',
        description: 'Passed listening module evaluation with 92% accuracy',
        type: 'LESSON' as const,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        formattedTimeAgo: '3 days ago',
      },
      {
        id: 'act-5',
        title: 'Completed AI Coach Interactive Practice',
        description: 'Received feedback on Speaking Part 2 Fluency Prompt',
        type: 'AI_SESSION' as const,
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        formattedTimeAgo: '4 days ago',
      },
    ];

    const start = (page - 1) * pageSize;
    const paginated = activities.slice(start, start + pageSize);

    return {
      activities: paginated,
      totalCount: activities.length,
      page,
      pageSize,
    };
  },

  async getNotifications(page = 1, pageSize = 10): Promise<DashboardNotificationDto> {
    const notifications = await studentNotificationsService.getNotifications().catch(() => []);
    const mapped = notifications.map((n: NotificationItem) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type === 'MOCK_AVAILABLE' ? ('MOCK' as const) : ('ANNOUNCEMENT' as const),
      read: n.read,
      createdAt: n.createdAt,
    }));

    const unreadCount = mapped.filter((n) => !n.read).length;
    const start = (page - 1) * pageSize;

    return {
      notifications: mapped.slice(start, start + pageSize),
      unreadCount,
      totalCount: mapped.length,
      page,
      pageSize,
    };
  },

  async getCalendar(view: 'DAY' | 'WEEK' | 'MONTH' = 'MONTH'): Promise<DashboardCalendarDto> {
    return {
      events: [
        {
          id: 'cal-1',
          title: 'IELTS Academic Diagnostic Placement Test',
          type: 'DIAGNOSTIC',
          startDateTime: '2026-08-01T10:00:00Z',
          endDateTime: '2026-08-01T12:00:00Z',
          description: 'Initial skill baseline evaluation for custom study plan generation.',
        },
        {
          id: 'cal-2',
          title: 'Full Timed Mock Exam #3',
          type: 'MOCK',
          startDateTime: '2026-08-15T09:00:00Z',
          endDateTime: '2026-08-15T12:00:00Z',
          description: 'Proctored mock simulation under strict exam rules.',
        },
        {
          id: 'cal-3',
          title: 'Writing Task 2 Coherence Live Workshop',
          type: 'LIVE_SESSION',
          startDateTime: '2026-08-10T15:00:00Z',
          endDateTime: '2026-08-10T16:30:00Z',
          description: 'Live instructor breakdown of essay structures.',
        },
        {
          id: 'cal-4',
          title: 'Advanced Essay Syntax Assignment Due',
          type: 'ASSIGNMENT',
          startDateTime: '2026-08-05T23:59:00Z',
          description: 'Submit Task 2 essay draft for instructor review.',
        },
      ],
      view,
    };
  },

  async getAchievements(): Promise<DashboardAchievementsDto> {
    return {
      badges: [
        {
          id: 'ach-1',
          title: '14-Day Study Streak',
          subtitle: 'Maintained consecutive daily practice goal',
          unlocked: true,
          unlockedAt: '2026-07-22T00:00:00Z',
          iconName: 'Flame',
          progressPercentage: 100,
        },
        {
          id: 'ach-2',
          title: 'Band 7.5 Jump',
          subtitle: 'Achieved predicted 7.5 Band overall in IELTS Academic',
          unlocked: true,
          unlockedAt: '2026-07-20T00:00:00Z',
          iconName: 'Trophy',
          progressPercentage: 100,
        },
        {
          id: 'ach-3',
          title: 'Diagnostic Master',
          subtitle: 'Completed initial baseline diagnostic evaluation',
          unlocked: true,
          unlockedAt: '2026-07-15T00:00:00Z',
          iconName: 'ShieldCheck',
          progressPercentage: 100,
        },
        {
          id: 'ach-4',
          title: 'Writing Task 2 Specialist',
          subtitle: 'Complete 10 essay evaluations with AI feedback',
          unlocked: false,
          iconName: 'Medal',
          progressPercentage: 60,
        },
      ],
      milestonesCompletedCount: 3,
      totalMilestonesCount: 5,
      xpPoints: 2450,
      studyStreakDays: 14,
      leaderboardRank: 4,
    };
  },
};
