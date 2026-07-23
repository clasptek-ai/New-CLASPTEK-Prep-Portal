import { describe, test, expect } from 'vitest';
import {
  MetricValue,
  CompletionRate,
  GrowthRate,
  DateRange,
  StudentDashboard,
  InstructorDashboard,
  AdminDashboard,
  CohortAnalytics,
  CompetencyAnalytics,
  LearningTrend,
  SnapshotVersion,
  ScheduledReport,
  LegacyMetricDefinition,
  MetricDefinition,
  AnalyticsJob,
  StudentDashboardProjection,
  InstructorDashboardProjection,
  AdminDashboardProjection,
  RuleBasedDashboardAggregationEngine,
  DefaultCompetencyTrendEngine,
  DefaultPredictionTrendEngine,
  DefaultCoachTrendEngine,
  DefaultPracticeTrendEngine,
  DefaultPlatformTrendEngine,
  DefaultCompetencyAnalyticsEngine,
  DefaultInstructorInsightEngine,
  DefaultPlatformMetricsEngine,
  DefaultExportEngine,
  TrendPoint,
  ExportJob,
  MetricCode,
  MetricFormula,
  MetricOwner,
  RefreshPolicy,
  MetricVersion,
  CalculationRule,
  MetricCatalog,
  AnalyticsSnapshot,
  EvidenceSummary,
  ConfidenceScore,
  ExecutiveFinding,
  ExecutiveInsight,
  ResearchExportJob,
} from './index';

describe('Learning Analytics Domain Value Objects', () => {
  test('MetricValue stores parameters', () => {
    const mv = new MetricValue(85.5, 'NORMAL');
    expect(mv.value).toBe(85.5);
    expect(mv.status).toBe('NORMAL');
  });

  test('CompletionRate computes accurate percentage', () => {
    const rate1 = new CompletionRate(8, 10);
    expect(rate1.rate).toBe(80);

    const rate2 = new CompletionRate(0, 0);
    expect(rate2.rate).toBe(0);
  });

  test('GrowthRate calculates positive and negative change', () => {
    const growth1 = new GrowthRate(120, 100);
    expect(growth1.percentChange).toBe(20);

    const growth2 = new GrowthRate(80, 100);
    expect(growth2.percentChange).toBe(-20);

    const growth3 = new GrowthRate(100, 0);
    expect(growth3.percentChange).toBe(0);
  });

  test('DateRange fails on invalid start/end sequence', () => {
    expect(() => new DateRange(new Date('2026-07-20'), new Date('2026-07-15'))).toThrow();
  });
});

describe('Learning Analytics Dashboards & Aggregates', () => {
  test('StudentDashboard aggregates widgets', () => {
    const dash = StudentDashboard.create('stud-1');
    expect(dash.studentId).toBe('stud-1');
    expect(dash.widgets).toHaveLength(0);
  });

  test('InstructorDashboard aggregate creates layout', () => {
    const dash = InstructorDashboard.create('inst-1', 'cohort-1');
    expect(dash.instructorId).toBe('inst-1');
    expect(dash.cohortId).toBe('cohort-1');
  });

  test('AdminDashboard aggregate creates layout', () => {
    const dash = AdminDashboard.create('org-1');
    expect(dash.orgId).toBe('org-1');
  });

  test('CohortAnalytics holds mastery values', () => {
    const cohort = CohortAnalytics.create(
      'cohort-1',
      78.5,
      { highRiskPercent: 10, mediumRiskPercent: 30, lowRiskPercent: 60 },
      45.5
    );
    expect(cohort.cohortId).toBe('cohort-1');
    expect(cohort.averageReadiness).toBe(78.5);
  });

  test('CompetencyAnalytics registers levels', () => {
    const ca = CompetencyAnalytics.create('COMP-1', 'Writing Skill', 82.3);
    expect(ca.competencyCode).toBe('COMP-1');
    expect(ca.averageScore).toBe(82.3);
  });

  test('LearningTrend dynamically determines direction', () => {
    const trend = LearningTrend.create('StudyMinutes');
    expect(trend.direction).toBe('STABLE');

    trend.addPoint(new TrendPoint(new Date('2026-07-10'), 20));
    trend.addPoint(new TrendPoint(new Date('2026-07-11'), 30));
    expect(trend.direction).toBe('UPWARD');

    const trend2 = LearningTrend.create('RiskScore');
    trend2.addPoint(new TrendPoint(new Date('2026-07-10'), 40));
    trend2.addPoint(new TrendPoint(new Date('2026-07-11'), 25));
    expect(trend2.direction).toBe('DOWNWARD');
  });

  test('SnapshotVersion is versioned and auditable', () => {
    const ver = SnapshotVersion.create(['StudentLearning', 'Prediction'], 'v1', 'v2');
    expect(ver.generatedAt).toBeDefined();
    expect(ver.sourceDomains).toContain('StudentLearning');
  });

  test('ScheduledReport registers schedule criteria', () => {
    const sched = ScheduledReport.create('report-1', 'test@test.com', '0 9 * * 1');
    expect(sched.recipientEmail).toBe('test@test.com');
    expect(sched.active).toBe(true);
  });

  test('MetricDefinition binds registry formula', () => {
    const kpi = new LegacyMetricDefinition({
      id: 'kpi-1',
      code: 'DAU',
      displayName: 'Daily Active Users',
      formula: 'DAUCount',
      owner: 'Ops',
      refreshFrequency: 'DAILY',
      unit: 'users',
      target: '500',
    });
    expect(kpi.code).toBe('DAU');
    expect(kpi.refreshFrequency).toBe('DAILY');
  });

  test('AnalyticsJob tracks execution steps', () => {
    const job = AnalyticsJob.create('admin-1', 'MANUAL');
    expect(job.status).toBe('PENDING');

    job.complete();
    expect(job.status).toBe('COMPLETED');
    expect(job.completedAt).toBeDefined();

    const job2 = AnalyticsJob.create('system', 'SCHEDULED');
    job2.fail('Database Timeout');
    expect(job2.status).toBe('FAILED');
    expect(job2.error).toBe('Database Timeout');
  });
});

describe('Dashboard Read Projections', () => {
  test('StudentDashboardProjection initiates', () => {
    const proj = new StudentDashboardProjection({
      studentId: 'stud-1',
      profileId: 'prof-1',
      readinessScore: 84.5,
    });
    expect(proj.studentId).toBe('stud-1');
    expect(proj.readinessScore).toBe(84.5);
  });

  test('InstructorDashboardProjection initiates', () => {
    const proj = new InstructorDashboardProjection({
      cohortId: 'cohort-1',
      overview: { count: 12 },
      riskMatrix: {},
      heatmap: {},
      completionRates: {},
      qualitySummary: {},
      predictionsDist: {},
      interventions: {},
      coachEngagement: {},
      topPerformers: {},
      attentionNeeded: {},
    });
    expect(proj.cohortId).toBe('cohort-1');
  });

  test('AdminDashboardProjection initiates', () => {
    const proj = new AdminDashboardProjection({
      orgId: 'org-1',
      platformUsage: {},
      dau: {},
      enrollments: {},
      completionStats: {},
      aiUsage: {},
      predictionAccuracy: {},
      infrastructure: {},
      revenue: {},
      growthTrends: {},
      retention: {},
    });
    expect(proj.orgId).toBe('org-1');
  });
});

describe('Domain Analytics Engines Stubs', () => {
  test('RuleBasedDashboardAggregationEngine runs mock aggregation', async () => {
    const engine = new RuleBasedDashboardAggregationEngine();
    const studProj = await engine.aggregateStudent('stud-1', 'prof-1', {});
    expect(studProj.readinessScore).toBe(82.5);

    const instProj = await engine.aggregateInstructor('cohort-1', {});
    expect(instProj.cohortId).toBe('cohort-1');

    const adminProj = await engine.aggregateAdmin('org-1', {});
    expect(adminProj.orgId).toBe('org-1');
  });

  test('DefaultTrendEngines produce trends', async () => {
    const compEngine = new DefaultCompetencyTrendEngine();
    const trend = await compEngine.calculateCompetencyTrend(
      'VOCAB',
      new DateRange(new Date(), new Date()),
      []
    );
    expect(trend.direction).toBe('UPWARD');

    const predEngine = new DefaultPredictionTrendEngine();
    const pt = await predEngine.calculatePredictionTrend(
      'v2',
      new DateRange(new Date(), new Date()),
      []
    );
    expect(pt.accuracyRate).toBe(88.5);

    const coachEngine = new DefaultCoachTrendEngine();
    const cu = await coachEngine.calculateCoachTrend(
      'coach-1',
      new DateRange(new Date(), new Date()),
      []
    );
    expect(cu.satisfactionScore).toBe(4.8);

    const practiceEngine = new DefaultPracticeTrendEngine();
    const prt = await practiceEngine.calculatePracticeTrend(
      'cohort-1',
      new DateRange(new Date(), new Date()),
      []
    );
    expect(prt.timeSpentSeconds).toBe(432000);

    const platformEngine = new DefaultPlatformTrendEngine();
    const platTrend = await platformEngine.calculatePlatformTrend(
      new DateRange(new Date(), new Date()),
      []
    );
    expect(platTrend.direction).toBe('UPWARD');
  });

  test('DefaultAnalyticsEngines calculate statistics', async () => {
    const compEngine = new DefaultCompetencyAnalyticsEngine();
    const res1 = await compEngine.analyzeCompetency('COMP-1', []);
    expect(res1.competencyCode).toBe('COMP-1');

    const instEngine = new DefaultInstructorInsightEngine();
    const res2 = await instEngine.generateInsights('cohort-1', []);
    expect(res2.recommendations.length).toBeGreaterThan(0);

    const platEngine = new DefaultPlatformMetricsEngine();
    const res3 = await platEngine.calculateKPIs(new Date(), []);
    expect(res3.dau).toBe(320);

    const expEngine = new DefaultExportEngine();
    const job = new ExportJob({
      id: 'export-1',
      format: 'CSV',
      status: 'PENDING',
      downloadExpiry: new Date(),
      generatedBy: 'admin',
    });
    const res4 = await expEngine.generateExport(job, []);
    expect(res4.url).toContain('analytics_export.csv');
  });
});

describe('Sprint 2.11.1 Enterprise Learning Analytics Domain Models', () => {
  test('MetricCatalog aggregate manages MetricDefinitions', () => {
    const catalog = new MetricCatalog('cat-1');
    const metric = new MetricDefinition({
      id: 'm1',
      code: new MetricCode('RETENTION_RATE'),
      name: 'Student Retention Rate',
      businessDefinition: 'Percentage of active students retained over 30 days',
      owner: new MetricOwner('Academic Operations', 'ops@clasptek.com'),
      refreshPolicy: new RefreshPolicy('DAILY'),
      currentVersion: new MetricVersion('v1.0.0', new Date()),
      calculationRule: new CalculationRule(
        'r1',
        new MetricFormula('retention_ratio', ['StudentLearning'], 'PERCENTILE')
      ),
      status: 'ACTIVE',
    });

    catalog.registerMetric(metric);
    expect(catalog.listMetrics()).toHaveLength(1);
    expect(catalog.getMetric('RETENTION_RATE')?.name).toBe('Student Retention Rate');
  });

  test('AnalyticsSnapshot captures point-in-time state', () => {
    const snap = new AnalyticsSnapshot({
      id: 'snap-100',
      generatedAt: new Date(),
      warehouseVersion: 'wh-v2.1',
      metricVersions: { RETENTION_RATE: 'v1.0.0', READINESS_GROWTH: 'v2.1.0' },
      benchmarkVersion: 'bench-2026-q3',
      predictionVersion: 'model-v4.2',
    });

    expect(snap.warehouseVersion).toBe('wh-v2.1');
    expect(snap.metricVersions.RETENTION_RATE).toBe('v1.0.0');
  });

  test('ExecutiveFinding and ExecutiveInsight separate evidence from narrative', () => {
    const finding = new ExecutiveFinding({
      id: 'find-1',
      topic: 'Programme Health',
      findingStatement: 'Programme A completion increased by 12%',
      evidence: new EvidenceSummary(
        [{ code: 'COMPLETION_RATE', value: 88.4, trend: 'UPWARD' }],
        new DateRange(new Date('2026-01-01'), new Date('2026-06-30')),
        '2025-Q4 Baseline',
        'Higher mock exam participation'
      ),
      confidence: new ConfidenceScore(0.95, 1200, 0.02),
      snapshotId: 'snap-100',
    });

    const insight = new ExecutiveInsight({
      id: 'ins-1',
      category: 'Executive Summary',
      title: 'Programme A Operational Efficiency',
      presentationNarrative: 'Programme A completion increased 12% compared with prior quarter.',
      primaryFindingId: finding.id,
      supportingFindingIds: [],
      recommendedActions: ['Expand coaching slots'],
      publishedAt: new Date(),
    });

    expect(finding.confidence.score).toBe(0.95);
    expect(insight.primaryFindingId).toBe('find-1');
  });

  test('ResearchExportJob handles lifecycle state transitions', () => {
    const exportJob = new ResearchExportJob({
      id: 'job-99',
      requestedBy: 'researcher-1',
      datasetType: 'READINESS',
      status: 'REQUESTED',
      isAnonymized: true,
      recordCount: 0,
      requestedAt: new Date(),
    });

    expect(exportJob.status).toBe('REQUESTED');
    exportJob.updateStatus('ANONYMIZING');
    expect(exportJob.status).toBe('ANONYMIZING');

    exportJob.updateStatus('READY', 'https://s3.clasptek.com/exports/readiness.csv', 5000);
    expect(exportJob.status).toBe('READY');
    expect(exportJob.recordCount).toBe(5000);
    expect(exportJob.completedAt).toBeDefined();
  });

  test('ConfidenceScore validates bounds', () => {
    expect(() => new ConfidenceScore(1.5, 100, 0.05)).toThrow(
      'Confidence score must be between 0.0 and 1.0'
    );
    expect(() => new ConfidenceScore(-0.1, 100, 0.05)).toThrow(
      'Confidence score must be between 0.0 and 1.0'
    );
  });
});
