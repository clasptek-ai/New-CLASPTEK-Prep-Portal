export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
    progress: () => [...queryKeys.dashboard.all, 'progress'] as const,
    upcomingDeadlines: () => [...queryKeys.dashboard.all, 'upcoming-deadlines'] as const,
    notifications: () => [...queryKeys.dashboard.all, 'notifications'] as const,
    readinessTrend: () => [...queryKeys.dashboard.all, 'readiness-trend'] as const,
  },
  student: {
    all: ['student'] as const,
    profile: (studentId?: string) =>
      [...queryKeys.student.all, 'profile', studentId ?? 'current'] as const,
    readiness: () => [...queryKeys.student.all, 'readiness'] as const,
    learning: () => [...queryKeys.student.all, 'learning'] as const,
  },
  practice: {
    all: ['practice'] as const,
    stats: () => [...queryKeys.practice.all, 'stats'] as const,
    sessions: () => [...queryKeys.practice.all, 'sessions'] as const,
    bookmarks: () => [...queryKeys.practice.all, 'bookmarks'] as const,
  },
  mock: {
    all: ['mock'] as const,
    exams: () => [...queryKeys.mock.all, 'exams'] as const,
    attempts: () => [...queryKeys.mock.all, 'attempts'] as const,
    session: (id: string) => [...queryKeys.mock.all, 'session', id] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    analytics: () => [...queryKeys.admin.all, 'analytics'] as const,
    auditLogs: () => [...queryKeys.admin.all, 'audit-logs'] as const,
  },
} as const;
