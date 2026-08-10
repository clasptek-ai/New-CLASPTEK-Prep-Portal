export interface DashboardMetricsDto {
  // Row 1 KPIs
  totalStudents: number;
  activeProgrammes: number;
  publishedQuestions: number;
  readingPassages: number;
  practiceSessionsToday: number;
  diagnosticsCompletedToday: number;

  // Row 2 KPIs
  mockExamsCompleted: number;
  averageReadiness: number;
  pendingReviewsCount: number;
  activeAssessments: number;
  studentRegistrationsToday: number;
  totalQuestionBankAssets: number;

  // Executive Charts & Analytics
  registrationTrend: Array<{ month: string; count: number }>;
  practiceActivityTrend: Array<{ day: string; count: number }>;
  readinessDistribution: { high: number; medium: number; low: number };
  programmeDistribution: Array<{ name: string; count: number }>;
  questionDistribution: {
    byExam: Array<{ name: string; count: number }>;
    bySkill: Array<{ name: string; count: number }>;
    byDifficulty: Array<{ name: string; count: number }>;
  };

  // Institutional Activity & Operational Tasks
  recentActivities: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    type?: string;
  }>;
  pendingTasks: Array<{
    label: string;
    status: string;
    color: string;
    actionUrl?: string;
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
