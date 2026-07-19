import { describe, test, expect, vi } from 'vitest';
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
  StudentDashboardProjectionRepository,
  InstructorDashboardProjectionRepository,
  AdminDashboardProjectionRepository,
  CompetencyProjectionRepository,
  RiskProjectionRepository,
  TrendRepository,
  ReportRepository,
  ExportRepository,
  AssessmentRuntimePort
} from './index';
import {
  RuleBasedDashboardAggregationEngine,
  DefaultCompetencyTrendEngine,
  DefaultPredictionTrendEngine,
  DefaultCoachTrendEngine,
  DefaultPlatformTrendEngine,
  DefaultPlatformMetricsEngine,
  DefaultExportEngine,
  StudentDashboardProjection,
  InstructorDashboardProjection,
  AdminDashboardProjection,
  CompetencyAnalytics,
  LearningTrend,
  ReportDefinition,
  ReportExecution,
  ScheduledReport,
  ExportJob
} from '@clasptek/domain-learning-analytics';

function createMockRepos() {
  const studentProjDb = new Map<string, StudentDashboardProjection>();
  const studentProjRepo: StudentDashboardProjectionRepository = {
    save: vi.fn().mockImplementation(async (p: StudentDashboardProjection) => { studentProjDb.set(`${p.studentId}-${p.profileId}`, p); }),
    find: vi.fn().mockImplementation(async (studentId: string, profileId: string) => studentProjDb.get(`${studentId}-${profileId}`) ?? null)
  };

  const instructorProjDb = new Map<string, InstructorDashboardProjection>();
  const instructorProjRepo: InstructorDashboardProjectionRepository = {
    save: vi.fn().mockImplementation(async (p: InstructorDashboardProjection) => { instructorProjDb.set(p.cohortId, p); }),
    find: vi.fn().mockImplementation(async (cohortId: string) => instructorProjDb.get(cohortId) ?? null)
  };

  const adminProjDb = new Map<string, AdminDashboardProjection>();
  const adminProjRepo: AdminDashboardProjectionRepository = {
    save: vi.fn().mockImplementation(async (p: AdminDashboardProjection) => { adminProjDb.set(p.orgId, p); }),
    find: vi.fn().mockImplementation(async (orgId: string) => adminProjDb.get(orgId) ?? null)
  };

  const compProjDb = new Map<string, CompetencyAnalytics>();
  const compProjRepo: CompetencyProjectionRepository = {
    save: vi.fn().mockImplementation(async (p: CompetencyAnalytics) => { compProjDb.set(p.competencyCode, p); }),
    find: vi.fn().mockImplementation(async (code: string) => compProjDb.get(code) ?? null)
  };

  const riskProjDb = new Map<string, any>();
  const riskProjRepo: RiskProjectionRepository = {
    save: vi.fn().mockImplementation(async (id: string, risk: string, score: number, factors: any, action: string) => {
      riskProjDb.set(id, { riskLevel: risk, score, factors, action });
    }),
    find: vi.fn().mockImplementation(async (id: string) => riskProjDb.get(id) ?? null)
  };

  const trendDb = new Map<string, LearningTrend>();
  const trendRepo: TrendRepository = {
    saveLearningTrend: vi.fn().mockImplementation(async (t: LearningTrend) => { trendDb.set(t.category, t); }),
    findLearningTrendByCategory: vi.fn().mockImplementation(async (cat: string) => trendDb.get(cat) ?? null),
    savePredictionTrend: vi.fn()
  };

  const reportDefDb = new Map<string, ReportDefinition>();
  const reportExecDb = new Map<string, ReportExecution>();
  const reportSchedDb = new Map<string, ScheduledReport>();
  const reportRepo: ReportRepository = {
    saveDefinition: vi.fn().mockImplementation(async (d: ReportDefinition) => { reportDefDb.set(d.code, d); }),
    findDefinitionByCode: vi.fn().mockImplementation(async (code: string) => reportDefDb.get(code) ?? null),
    saveExecution: vi.fn().mockImplementation(async (e: ReportExecution) => { reportExecDb.set(e.id, e); }),
    findExecutionById: vi.fn().mockImplementation(async (id: string) => reportExecDb.get(id) ?? null),
    saveSchedule: vi.fn().mockImplementation(async (s: ScheduledReport) => { reportSchedDb.set(s.id, s); }),
    findActiveSchedules: vi.fn().mockImplementation(async () => Array.from(reportSchedDb.values()))
  };

  const exportDb = new Map<string, ExportJob>();
  const exportRepo: ExportRepository = {
    saveJob: vi.fn().mockImplementation(async (j: ExportJob) => { exportDb.set(j.id, j); }),
    findJobById: vi.fn().mockImplementation(async (id: string) => exportDb.get(id) ?? null)
  };

  return { studentProjRepo, instructorProjRepo, adminProjRepo, compProjRepo, riskProjRepo, trendRepo, reportRepo, exportRepo };
}

describe('Learning Analytics Command Handlers', () => {
  test('GenerateStudentDashboardHandler saves student view read models', async () => {
    const { studentProjRepo } = createMockRepos();
    const aggregationEngine = new RuleBasedDashboardAggregationEngine();
    const handler = new GenerateStudentDashboardHandler(studentProjRepo, aggregationEngine);

    const proj = await handler.execute({ studentId: 'stud-1', profileId: 'prof-1' });
    expect(proj.studentId).toBe('stud-1');
    expect(studentProjRepo.save).toHaveBeenCalled();
  });

  test('GenerateInstructorDashboardHandler saves cohort summary views', async () => {
    const { instructorProjRepo } = createMockRepos();
    const aggregationEngine = new RuleBasedDashboardAggregationEngine();
    const handler = new GenerateInstructorDashboardHandler(instructorProjRepo, aggregationEngine);

    const proj = await handler.execute({ instructorId: 'inst-1', cohortId: 'cohort-1' });
    expect(proj.cohortId).toBe('cohort-1');
    expect(instructorProjRepo.save).toHaveBeenCalled();
  });

  test('GenerateAdminDashboardHandler saves global KPIs projections', async () => {
    const { adminProjRepo } = createMockRepos();
    const aggregationEngine = new RuleBasedDashboardAggregationEngine();
    const handler = new GenerateAdminDashboardHandler(adminProjRepo, aggregationEngine);

    const proj = await handler.execute({ orgId: 'org-1' });
    expect(proj.orgId).toBe('org-1');
    expect(adminProjRepo.save).toHaveBeenCalled();
  });

  test('RefreshAnalyticsHandler executes development synchronous flow', async () => {
    const { studentProjRepo, instructorProjRepo, adminProjRepo } = createMockRepos();
    const aggregationEngine = new RuleBasedDashboardAggregationEngine();
    const handler = new RefreshAnalyticsHandler(aggregationEngine, studentProjRepo, instructorProjRepo, adminProjRepo);

    const job = await handler.execute({ initiatedBy: 'admin-1', isProduction: false });
    expect(job.status).toBe('COMPLETED');
    expect(studentProjRepo.save).toHaveBeenCalled();
  });

  test('RefreshAnalyticsHandler routes through background worker queue for production', async () => {
    const { studentProjRepo, instructorProjRepo, adminProjRepo } = createMockRepos();
    const aggregationEngine = new RuleBasedDashboardAggregationEngine();
    const handler = new RefreshAnalyticsHandler(aggregationEngine, studentProjRepo, instructorProjRepo, adminProjRepo);

    const job = await handler.execute({ initiatedBy: 'admin-1', isProduction: true });
    expect(job.status).toBe('PENDING');
    expect(studentProjRepo.save).not.toHaveBeenCalled();
  });

  test('GenerateTrendAnalysisHandler tracks metric timelines', async () => {
    const { trendRepo } = createMockRepos();
    const compTrendEngine = new DefaultCompetencyTrendEngine();
    const platformTrendEngine = new DefaultPlatformTrendEngine();
    const handler = new GenerateTrendAnalysisHandler(trendRepo, compTrendEngine, platformTrendEngine);

    const trend = await handler.execute({
      category: 'COMPETENCY',
      targetId: 'COMP-1',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-15')
    });
    expect(trend.category).toBe('COMP-1');
    expect(trendRepo.saveLearningTrend).toHaveBeenCalled();
  });

  test('GenerateReportHandler registers completed execution results', async () => {
    const { reportRepo } = createMockRepos();
    const def = new ReportDefinition({ id: 'def-1', code: 'WEEKLY_STATUS', name: 'Weekly Status', templateJson: {} });
    await reportRepo.saveDefinition(def);

    const handler = new GenerateReportHandler(reportRepo);
    const execution = await handler.execute({ reportDefinitionCode: 'WEEKLY_STATUS' });
    expect(execution.status).toBe('COMPLETED');
    expect(execution.resultUrl).toBeDefined();
  });

  test('ExportAnalyticsHandler processes asynchronous formats and registers expiries', async () => {
    const { exportRepo } = createMockRepos();
    const exportEngine = new DefaultExportEngine();
    const handler = new ExportAnalyticsHandler(exportRepo, exportEngine);

    const job = await handler.execute({ format: 'CSV', generatedBy: 'inst-1' });
    expect(job.status).toBe('COMPLETED');
    expect(job.downloadUrl).toContain('analytics_export.csv');
  });

  test('ScheduleReportHandler schedules custom recurring reports', async () => {
    const { reportRepo } = createMockRepos();
    const def = new ReportDefinition({ id: 'def-1', code: 'WEEKLY_STATUS', name: 'Weekly Status', templateJson: {} });
    await reportRepo.saveDefinition(def);

    const handler = new ScheduleReportHandler(reportRepo);
    const sched = await handler.execute({ reportDefinitionCode: 'WEEKLY_STATUS', recipientEmail: 'test@clasptek.com', cronExpression: '0 9 * * 1' });
    expect(sched.recipientEmail).toBe('test@clasptek.com');
  });

  test('RefreshProjectionHandler overrides dynamic projections', async () => {
    const { studentProjRepo, instructorProjRepo, adminProjRepo } = createMockRepos();
    const aggregationEngine = new RuleBasedDashboardAggregationEngine();
    const handler = new RefreshProjectionHandler(aggregationEngine, studentProjRepo, instructorProjRepo, adminProjRepo);

    await handler.execute({ projectionType: 'STUDENT', targetId: 'stud-1', profileId: 'prof-1' });
    expect(studentProjRepo.save).toHaveBeenCalled();
  });
});

describe('Learning Analytics Query Handlers', () => {
  test('GetStudentDashboardHandler fetches read models', async () => {
    const { studentProjRepo } = createMockRepos();
    const proj = new StudentDashboardProjection({ studentId: 'stud-1', profileId: 'prof-1', readinessScore: 84.5 });
    await studentProjRepo.save(proj);

    const handler = new GetStudentDashboardHandler(studentProjRepo);
    const result = await handler.execute('stud-1', 'prof-1');
    expect(result?.readinessScore).toBe(84.5);
  });

  test('GetInstructorDashboardHandler fetches cohort projections', async () => {
    const { instructorProjRepo } = createMockRepos();
    const proj = new InstructorDashboardProjection({
      cohortId: 'cohort-1', overview: {}, riskMatrix: {}, heatmap: {},
      completionRates: {}, qualitySummary: {}, predictionsDist: {},
      interventions: {}, coachEngagement: {}, topPerformers: {}, attentionNeeded: {}
    });
    await instructorProjRepo.save(proj);

    const handler = new GetInstructorDashboardHandler(instructorProjRepo);
    const result = await handler.execute('cohort-1');
    expect(result?.cohortId).toBe('cohort-1');
  });

  test('GetAdminDashboardHandler fetches organizational projections', async () => {
    const { adminProjRepo } = createMockRepos();
    const proj = new AdminDashboardProjection({
      orgId: 'org-1', platformUsage: {}, dau: {}, enrollments: {},
      completionStats: {}, aiUsage: {}, predictionAccuracy: {},
      infrastructure: {}, revenue: {}, growthTrends: {}, retention: {}
    });
    await adminProjRepo.save(proj);

    const handler = new GetAdminDashboardHandler(adminProjRepo);
    const result = await handler.execute('org-1');
    expect(result?.orgId).toBe('org-1');
  });

  test('GetCompetencyAnalyticsHandler returns competency mastery projections', async () => {
    const { compProjRepo } = createMockRepos();
    const ca = CompetencyAnalytics.create('VOCAB', 'Vocabulary', 80);
    await compProjRepo.save(ca);

    const handler = new GetCompetencyAnalyticsHandler(compProjRepo);
    const result = await handler.execute('VOCAB');
    expect(result?.displayName).toBe('Vocabulary');
  });

  test('GetPredictionAnalyticsHandler resolves metrics accuracy', async () => {
    const predEngine = new DefaultPredictionTrendEngine();
    const handler = new GetPredictionAnalyticsHandler(predEngine);
    const res = await handler.execute('v1.0');
    expect(res.accuracyRate).toBe(88.5);
  });

  test('GetAssessmentAnalyticsHandler calls assessment port', async () => {
    const assessmentPort: AssessmentRuntimePort = {
      getSubmissions: vi.fn().mockResolvedValue([{ score: 80 }, { score: 90 }])
    };
    const handler = new GetAssessmentAnalyticsHandler(assessmentPort);
    const res = await handler.execute('cohort-1');
    expect(res.submissionsCount).toBe(2);
    expect(res.averageScore).toBe(85);
  });

  test('GetLearningTrendHandler queries historical trend timelines', async () => {
    const { trendRepo } = createMockRepos();
    const trend = LearningTrend.create('StudyMinutes');
    await trendRepo.saveLearningTrend(trend);

    const handler = new GetLearningTrendHandler(trendRepo);
    const result = await handler.execute('StudyMinutes');
    expect(result?.category).toBe('StudyMinutes');
  });

  test('GetCoachAnalyticsHandler resolves coach tokens consumption and sessions count', async () => {
    const coachEngine = new DefaultCoachTrendEngine();
    const handler = new GetCoachAnalyticsHandler(coachEngine);
    const res = await handler.execute('coach-1');
    expect(res.totalSessions).toBe(14);
  });

  test('GetPlatformMetricsHandler evaluates global metrics and DAUs', async () => {
    const metricsEngine = new DefaultPlatformMetricsEngine();
    const handler = new GetPlatformMetricsHandler(metricsEngine);
    const res = await handler.execute();
    expect(res.dau).toBe(320);
  });

  test('SearchReportsHandler scans active scheduled report schedules', async () => {
    const { reportRepo } = createMockRepos();
    const sched = ScheduledReport.create('def-1', 'inst@clasptek.com', '0 9 * * 1');
    await reportRepo.saveSchedule(sched);

    const handler = new SearchReportsHandler(reportRepo);
    const res = await handler.execute('WEEKLY');
    expect(res.length).toBeGreaterThan(0);
  });
});
