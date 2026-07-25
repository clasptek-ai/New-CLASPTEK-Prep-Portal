export interface StudentProfileDto {
  id: string;
  studentName: string;
  avatarUrl?: string;
  currentProgrammeId: string;
  currentProgrammeTitle: string;
  studyStreakDays: number;
  currentLevel: string;
  totalStudyHours: number;
  overallCompletionPercentage: number;
  lastLoginAt: string;
  activeCohortName: string;
  academicStatus: 'ACTIVE' | 'AT_RISK' | 'EXCELLING' | 'PAUSED';
}

export interface CourseProgressDto {
  currentCourseId: string;
  currentCourseTitle: string;
  currentModuleId: string;
  currentModuleTitle: string;
  lessonCompletionCount: number;
  totalLessonsCount: number;
  videoCompletionPercentage: number;
  readingCompletionPercentage: number;
  quizCompletionPercentage: number;
  estimatedCompletionDate: string;
  overallProgrammeProgress: number;
  resumeLessonId?: string;
  resumeLessonTitle?: string;
}

export interface AssessmentSummaryDto {
  diagnostic: {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    nextRecommendedTitle?: string;
    previousScore?: number;
    maxScore?: number;
    skillWeaknesses: string[];
    aiRecommendations: string[];
  };
  mock: {
    upcomingMockDate?: string;
    upcomingMockTitle?: string;
    previousMockScore?: number;
    readinessLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXAM_READY';
    predictedExamScore: string;
  };
}

export interface AISummaryDto {
  topRecommendation: {
    category: string;
    title: string;
    subtitle: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estMinutes: number;
  };
  weakSkillAreas: string[];
  suggestedLessons: { id: string; title: string }[];
  dailyTips: string[];
  activeConversationId?: string;
}

export interface DashboardOverviewDto {
  profile: StudentProfileDto;
  progress: CourseProgressDto;
  assessmentSummary: AssessmentSummaryDto;
  aiSummary: AISummaryDto;
  unreadNotificationsCount: number;
}

export interface DashboardActivityItemDto {
  id: string;
  title: string;
  description: string;
  type: 'LESSON' | 'QUIZ' | 'MOCK' | 'ACHIEVEMENT' | 'AI_SESSION';
  timestamp: string;
  formattedTimeAgo: string;
}

export interface DashboardActivityDto {
  activities: DashboardActivityItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface DashboardNotificationItemDto {
  id: string;
  title: string;
  content: string;
  type: 'LESSON' | 'ASSESSMENT' | 'MOCK' | 'ANNOUNCEMENT' | 'AI_REC' | 'ACHIEVEMENT';
  read: boolean;
  createdAt: string;
}

export interface DashboardNotificationDto {
  notifications: DashboardNotificationItemDto[];
  unreadCount: number;
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CalendarEventDto {
  id: string;
  title: string;
  type: 'CLASS' | 'ASSIGNMENT' | 'MOCK' | 'DIAGNOSTIC' | 'LIVE_SESSION' | 'HOLIDAY' | 'EVENT';
  startDateTime: string;
  endDateTime?: string;
  description?: string;
  isAllDay?: boolean;
}

export interface DashboardCalendarDto {
  events: CalendarEventDto[];
  view: 'DAY' | 'WEEK' | 'MONTH';
}

export interface BadgeDto {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
  unlockedAt?: string;
  iconName: string;
  progressPercentage: number;
}

export interface DashboardAchievementsDto {
  badges: BadgeDto[];
  milestonesCompletedCount: number;
  totalMilestonesCount: number;
  xpPoints: number;
  studyStreakDays: number;
  leaderboardRank?: number;
}
