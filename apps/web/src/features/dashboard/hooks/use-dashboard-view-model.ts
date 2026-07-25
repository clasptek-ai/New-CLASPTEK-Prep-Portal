import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProgrammeId, ProgrammeConfiguration } from '../models/programme-config';
import { ProgrammeRegistry } from '../models/programme-registry';
import {
  useDashboardOverview,
  useDashboardActivity,
  useDashboardNotificationsQuery,
  useDashboardCalendarQuery,
  useDashboardAchievementsQuery,
  useMarkNotificationReadMutation,
} from '../use-dashboard-queries';
import {
  DashboardOverviewDto,
  DashboardActivityDto,
  DashboardNotificationDto,
  DashboardCalendarDto,
  DashboardAchievementsDto,
} from '../../../services/student/dtos/dashboard.dto';

export interface NavigationRouteConfig {
  id: string;
  title: string;
  path: string;
}

export interface DashboardViewModel {
  activeProgrammeId: ProgrammeId;
  config: ProgrammeConfiguration;
  programmeIds: ProgrammeId[];
  isLoading: boolean;
  isError: boolean;
  studentName: string;
  avatarUrl?: string;
  studyStreakDays: number;
  completedTasksCount: number;
  totalTasksCount: number;
  activeNotificationsCount: number;
  overview?: DashboardOverviewDto;
  activity?: DashboardActivityDto;
  notifications?: DashboardNotificationDto;
  calendar?: DashboardCalendarDto;
  achievements?: DashboardAchievementsDto;
  calendarView: 'DAY' | 'WEEK' | 'MONTH';

  // Navigation Config for Quick Actions
  navigationRoutes: Record<string, string>;

  // Handlers
  selectProgramme: (id: ProgrammeId) => void;
  setCalendarView: (view: 'DAY' | 'WEEK' | 'MONTH') => void;
  handleQuickAction: (actionId: string) => void;
  handleMarkNotificationRead: (id: string) => void;
  refetch: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const router = useRouter();
  const [activeProgrammeId, setActiveProgrammeId] = useState<ProgrammeId>('IELTS_ACADEMIC');
  const [calendarView, setCalendarView] = useState<'DAY' | 'WEEK' | 'MONTH'>('MONTH');

  // React Query Hooks
  const { data: overview, isLoading, isError, refetch } = useDashboardOverview();
  const { data: activity } = useDashboardActivity(1, 5);
  const { data: notifications } = useDashboardNotificationsQuery(1, 10);
  const { data: calendar } = useDashboardCalendarQuery(calendarView);
  const { data: achievements } = useDashboardAchievementsQuery();
  const markReadMutation = useMarkNotificationReadMutation();

  // Centralized Navigation Config (Rule 4: Avoid hardcoding routes in widgets)
  const navigationRoutes = useMemo<Record<string, string>>(
    () => ({
      'diagnostic-assessment': '/student/assessments',
      'full-mock-test': '/student/mock',
      'reading-practice': '/practice?drill=reading',
      'listening-practice': '/practice?drill=listening',
      'writing-practice': '/practice?drill=writing',
      'speaking-practice': '/practice?drill=speaking',
      'vocabulary-builder': '/practice?drill=vocabulary',
      'flashcards-drill': '/practice?drill=flashcards',
      'resume-last-lesson': '/learning',
      'browse-courses': '/learning',
      'open-ai-coach': '/learning-assistant',
      'view-results': '/results',
      'view-calendar': '/student/calendar',
    }),
    []
  );

  const programmeIds = useMemo<ProgrammeId[]>(
    () => ['IELTS_ACADEMIC', 'IELTS_GENERAL', 'SAT', 'TOEFL', 'CELPIP'],
    []
  );

  const config = useMemo(() => {
    return ProgrammeRegistry.get(activeProgrammeId);
  }, [activeProgrammeId]);

  const selectProgramme = useCallback((id: ProgrammeId) => {
    setActiveProgrammeId(id);
  }, []);

  const handleQuickAction = useCallback(
    (actionId: string) => {
      const targetPath = navigationRoutes[actionId] || `/practice?drill=${actionId}`;
      router.push(targetPath);
    },
    [navigationRoutes, router]
  );

  const handleMarkNotificationRead = useCallback(
    (id: string) => {
      markReadMutation.mutate(id);
    },
    [markReadMutation]
  );

  let registeredName = 'Student';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('clasptek_onboarding_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.firstName) {
          registeredName = parsed.lastName
            ? `${parsed.firstName} ${parsed.lastName}`
            : parsed.firstName;
        }
      }
    } catch {
      // Ignore
    }
  }

  const studentName = overview?.profile.studentName || registeredName;
  const avatarUrl = overview?.profile.avatarUrl;
  const studyStreakDays = overview?.profile.studyStreakDays || 14;
  const completedTasksCount = overview?.progress.lessonCompletionCount || 17;
  const totalTasksCount = overview?.progress.totalLessonsCount || 25;
  const activeNotificationsCount =
    notifications?.unreadCount || overview?.unreadNotificationsCount || 2;

  return {
    activeProgrammeId,
    config,
    programmeIds,
    isLoading,
    isError,
    studentName,
    avatarUrl,
    studyStreakDays,
    completedTasksCount,
    totalTasksCount,
    activeNotificationsCount,
    overview,
    activity,
    notifications,
    calendar,
    achievements,
    calendarView,
    navigationRoutes,

    selectProgramme,
    setCalendarView,
    handleQuickAction,
    handleMarkNotificationRead,
    refetch,
  };
}
