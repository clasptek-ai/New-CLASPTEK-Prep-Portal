import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import { studentDashboardService } from '../../services/student/dashboard.service';
import {
  DashboardOverviewDto,
  DashboardActivityDto,
  DashboardNotificationDto,
  DashboardCalendarDto,
  DashboardAchievementsDto,
} from '../../services/student/dtos/dashboard.dto';

export function useDashboardOverview() {
  return useQuery<DashboardOverviewDto>({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => studentDashboardService.getOverview(),
  });
}

export function useDashboardActivity(page = 1, pageSize = 5) {
  return useQuery<DashboardActivityDto>({
    queryKey: ['dashboard', 'activity', page, pageSize],
    queryFn: () => studentDashboardService.getActivity(page, pageSize),
  });
}

export function useDashboardNotificationsQuery(page = 1, pageSize = 10) {
  return useQuery<DashboardNotificationDto>({
    queryKey: ['dashboard', 'notifications', page, pageSize],
    queryFn: () => studentDashboardService.getNotifications(page, pageSize),
  });
}

export function useDashboardCalendarQuery(view: 'DAY' | 'WEEK' | 'MONTH' = 'MONTH') {
  return useQuery<DashboardCalendarDto>({
    queryKey: ['dashboard', 'calendar', view],
    queryFn: () => studentDashboardService.getCalendar(view),
  });
}

export function useDashboardAchievementsQuery() {
  return useQuery<DashboardAchievementsDto>({
    queryKey: ['dashboard', 'achievements'],
    queryFn: () => studentDashboardService.getAchievements(),
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      studentDashboardService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'notifications'] });
    },
  });
}

// Backward compatibility adapters
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => studentDashboardService.getDashboardData(),
  });
}

export function useDashboardProgress() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => studentDashboardService.getDashboardData(),
    select: (data) => data.stats,
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => studentDashboardService.getDashboardData(),
    select: (data) => data.upcomingDeadlines,
  });
}

export function useDashboardNotifications() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => studentDashboardService.getDashboardData(),
    select: (data) => data.notifications,
  });
}
