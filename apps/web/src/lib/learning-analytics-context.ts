import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresAnalyticsDashboardRepository,
  PostgresAnalyticsSnapshotRepository,
  PostgresTrendRepository,
  PostgresReportRepository,
  PostgresExportRepository,
  PostgresWidgetRepository,
  PostgresStudentDashboardProjectionRepository,
  PostgresInstructorDashboardProjectionRepository,
  PostgresAdminDashboardProjectionRepository,
  PostgresCompetencyProjectionRepository,
  PostgresRiskProjectionRepository
} from '@clasptek/persistence';
import {
  RuleBasedDashboardAggregationEngine,
  DefaultCompetencyTrendEngine,
  DefaultPredictionTrendEngine,
  DefaultCoachTrendEngine,
  DefaultPracticeTrendEngine,
  DefaultPlatformTrendEngine,
  DefaultCompetencyAnalyticsEngine,
  DefaultInstructorInsightEngine,
  DefaultPlatformMetricsEngine,
  DefaultExportEngine
} from '@clasptek/domain-learning-analytics';
import {
  GenerateStudentDashboardHandler,
  GenerateInstructorDashboardHandler,
  GenerateAdminDashboardHandler,
  RefreshAnalyticsHandler,
  GenerateTrendAnalysisHandler,
  GenerateReportHandler,
  ExportAnalyticsHandler,
  ScheduleReportHandler,
  RefreshProjectionHandler,
  GetStudentDashboardHandler,
  GetInstructorDashboardHandler,
  GetAdminDashboardHandler,
  GetCompetencyAnalyticsHandler,
  GetPredictionAnalyticsHandler,
  GetAssessmentAnalyticsHandler,
  GetLearningTrendHandler,
  GetCoachAnalyticsHandler,
  GetPlatformMetricsHandler,
  SearchReportsHandler,
  StudentLearningPort,
  AssessmentRuntimePort,
  EvaluationPort,
  PredictionPort,
  LearningCoachPort,
  AdaptivePracticePort,
  CurriculumPort,
  QuestionBankPort
} from '@clasptek/application-learning-analytics';

export interface LearningAnalyticsContext {
  // Commands
  generateStudentDashboard: GenerateStudentDashboardHandler;
  generateInstructorDashboard: GenerateInstructorDashboardHandler;
  generateAdminDashboard: GenerateAdminDashboardHandler;
  refreshAnalytics: RefreshAnalyticsHandler;
  generateTrendAnalysis: GenerateTrendAnalysisHandler;
  generateReport: GenerateReportHandler;
  exportAnalytics: ExportAnalyticsHandler;
  scheduleReport: ScheduleReportHandler;
  refreshProjection: RefreshProjectionHandler;

  // Queries
  getStudentDashboard: GetStudentDashboardHandler;
  getInstructorDashboard: GetInstructorDashboardHandler;
  getAdminDashboard: GetAdminDashboardHandler;
  getCompetencyAnalytics: GetCompetencyAnalyticsHandler;
  getPredictionAnalytics: GetPredictionAnalyticsHandler;
  getAssessmentAnalytics: GetAssessmentAnalyticsHandler;
  getLearningTrend: GetLearningTrendHandler;
  getCoachAnalytics: GetCoachAnalyticsHandler;
  getPlatformMetrics: GetPlatformMetricsHandler;
  searchReports: SearchReportsHandler;
}

// ─── Ports Stubs ──────────────────────────────────────────────────
class MockStudentLearningPort implements StudentLearningPort {
  async getLearningState(_studentId: string): Promise<Record<string, any>> {
    return { velocity: 85, competenciesMastered: 12 };
  }
}

class MockAssessmentRuntimePort implements AssessmentRuntimePort {
  async getSubmissions(_cohortId: string): Promise<any[]> {
    return [{ score: 85 }, { score: 92 }];
  }
}

class MockEvaluationPort implements EvaluationPort {
  async getEvaluationMetrics(): Promise<Record<string, any>> {
    return { agreementRate: 88.5, humOverrideRate: 4.2 };
  }
}

class MockPredictionPort implements PredictionPort {
  async getPredictionHistory(_studentId: string): Promise<any[]> {
    return [{ date: new Date(), accuracy: 87.5 }];
  }
}

class MockLearningCoachPort implements MockLearningCoachPort {
  async getCoachEngagementStats(_coachId: string): Promise<Record<string, any>> {
    return { totalSessions: 14, totalMessages: 98 };
  }
}

class MockAdaptivePracticePort implements AdaptivePracticePort {
  async getPracticeTimeline(_cohortId: string): Promise<any[]> {
    return [{ score: 78, accuracy: 80 }];
  }
}

class MockCurriculumPort implements CurriculumPort {
  async getCompetenciesList(): Promise<any[]> {
    return [{ code: 'COMP-1', name: 'Grammar' }];
  }
}

class MockQuestionBankPort implements QuestionBankPort {
  async getQuestionDifficulties(): Promise<any[]> {
    return [{ code: 'Q-1', difficulty: 'MEDIUM' }];
  }
}

let cached: LearningAnalyticsContext | null = null;

export async function getLearningAnalyticsContext(): Promise<LearningAnalyticsContext> {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('learning-analytics-context');
  const dbPool = new DatabasePool(env, logger);

  await dbPool.connect();

  // Repositories
  const dashboardRepo = new PostgresAnalyticsDashboardRepository(dbPool);
  const snapshotRepo = new PostgresAnalyticsSnapshotRepository(dbPool);
  const trendRepo = new PostgresTrendRepository(dbPool);
  const reportRepo = new PostgresReportRepository(dbPool);
  const exportRepo = new PostgresExportRepository(dbPool);
  const widgetRepo = new PostgresWidgetRepository(dbPool);

  const studentProjRepo = new PostgresStudentDashboardProjectionRepository(dbPool);
  const instructorProjRepo = new PostgresInstructorDashboardProjectionRepository(dbPool);
  const adminProjRepo = new PostgresAdminDashboardProjectionRepository(dbPool);
  const competencyProjRepo = new PostgresCompetencyProjectionRepository(dbPool);
  const riskProjRepo = new PostgresRiskProjectionRepository(dbPool);

  // Ports
  const assessmentPort = new MockAssessmentRuntimePort();

  // Engines
  const dashboardAggregationEngine = new RuleBasedDashboardAggregationEngine();
  const compTrendEngine = new DefaultCompetencyTrendEngine();
  const predictionTrendEngine = new DefaultPredictionTrendEngine();
  const coachTrendEngine = new DefaultCoachTrendEngine();
  const platformTrendEngine = new DefaultPlatformTrendEngine();
  const metricsEngine = new DefaultPlatformMetricsEngine();
  const exportEngine = new DefaultExportEngine();

  cached = {
    generateStudentDashboard: new GenerateStudentDashboardHandler(studentProjRepo, dashboardAggregationEngine),
    generateInstructorDashboard: new GenerateInstructorDashboardHandler(instructorProjRepo, dashboardAggregationEngine),
    generateAdminDashboard: new GenerateAdminDashboardHandler(adminProjRepo, dashboardAggregationEngine),
    refreshAnalytics: new RefreshAnalyticsHandler(
      dashboardAggregationEngine,
      studentProjRepo,
      instructorProjRepo,
      adminProjRepo
    ),
    generateTrendAnalysis: new GenerateTrendAnalysisHandler(trendRepo, compTrendEngine, platformTrendEngine),
    generateReport: new GenerateReportHandler(reportRepo),
    exportAnalytics: new ExportAnalyticsHandler(exportRepo, exportEngine),
    scheduleReport: new ScheduleReportHandler(reportRepo),
    refreshProjection: new RefreshProjectionHandler(
      dashboardAggregationEngine,
      studentProjRepo,
      instructorProjRepo,
      adminProjRepo
    ),

    getStudentDashboard: new GetStudentDashboardHandler(studentProjRepo),
    getInstructorDashboard: new GetInstructorDashboardHandler(instructorProjRepo),
    getAdminDashboard: new GetAdminDashboardHandler(adminProjRepo),
    getCompetencyAnalytics: new GetCompetencyAnalyticsHandler(competencyProjRepo),
    getPredictionAnalytics: new GetPredictionAnalyticsHandler(predictionTrendEngine),
    getAssessmentAnalytics: new GetAssessmentAnalyticsHandler(assessmentPort),
    getLearningTrend: new GetLearningTrendHandler(trendRepo),
    getCoachAnalytics: new GetCoachAnalyticsHandler(coachTrendEngine),
    getPlatformMetrics: new GetPlatformMetricsHandler(metricsEngine),
    searchReports: new SearchReportsHandler(reportRepo)
  };

  return cached;
}
