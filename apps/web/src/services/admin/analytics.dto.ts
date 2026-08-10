export interface DashboardMetricsDto {
  totalStudents: number;
  publishedQuestions: number;
  practiceSessionsToday: number;
  diagnosticsCompleted: number;
  mockExamsCompleted: number;
  averageReadiness: number;
  atRiskStudentsCount: number;
  pendingReviewsCount: number;
  recentActivities: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
  }>;
  pendingTasks: Array<{
    label: string;
    status: string;
    color: string;
  }>;
}

export interface InfrastructureHealthDto {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  services: Array<{
    name: string;
    status: 'Healthy' | 'Warning' | 'Offline';
    detail: string;
  }>;
  lastCheckedAt: string;
}

export interface StudentAnalyticsDto {
  totalStudents: number;
  activeStudents: number;
  averageReadiness: number;
  averageBand: number;
  studentsAtRisk: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    registrationDate: string;
    lastLogin: string | null;
    currentProgramme: string;
    readinessScore: number;
    diagnosticStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
    mockStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
    practiceCount: number;
    overallProgress: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    readingAvg: number;
    writingAvg: number;
    listeningAvg: number;
    speakingAvg: number;
  }>;
}

export interface QuestionBankMetricsDto {
  total: number;
  draft: number;
  published: number;
  archived: number;
  approved: number;
  underReview: number;
}

export interface ProgrammeAnalyticsDto {
  programmes: Array<{
    id: string;
    name: string;
    code: string;
    currentEnrollment: number;
    maxCapacity: number;
    remainingSeats: number;
    publishedModules: number;
    assessmentsCount: number;
    averageScore: number;
    completionPercentage: number;
  }>;
}

export interface PracticeAnalyticsDto {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  averageAccuracy: number;
  totalQuestionsAnswered: number;
  mostPracticedSkill: string;
  averageDailySessions: number;
  recentAttempts: Array<{
    id: string;
    studentName: string;
    score: number;
    completedAt: string;
    mode: string;
  }>;
}

export interface DiagnosticAnalyticsDto {
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  averageDurationMinutes: number;
  averageBand: number;
  passRate: number;
  topWeakSkill: string;
  topStrongSkill: string;
}

export interface MockAnalyticsDto {
  registeredCandidates: number;
  completedMocks: number;
  averageScore: number;
  averageTimeMinutes: number;
  completionPercentage: number;
  bandDistribution: Record<string, number>;
}
