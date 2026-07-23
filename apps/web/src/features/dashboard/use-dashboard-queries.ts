import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import {
  studentDashboardService,
  DashboardAggregatedData,
} from '../../services/student/dashboard.service';

export function useDashboardSummary() {
  return useQuery<DashboardAggregatedData>({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => studentDashboardService.getDashboardData(),
  });
}

export function useDashboardProgress() {
  return useQuery({
    queryKey: queryKeys.dashboard.progress(),
    queryFn: async () => {
      const data = await studentDashboardService.getDashboardData();
      return data.stats;
    },
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: queryKeys.dashboard.upcomingDeadlines(),
    queryFn: async () => {
      const data = await studentDashboardService.getDashboardData();
      return data.upcomingDeadlines;
    },
  });
}

export function useDashboardNotifications() {
  return useQuery({
    queryKey: queryKeys.dashboard.notifications(),
    queryFn: async () => {
      const data = await studentDashboardService.getDashboardData();
      return data.notifications;
    },
  });
}
