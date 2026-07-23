import { describe, test, expect, vi, beforeEach } from 'vitest';

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { DatabasePool } from './index';
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
  PostgresRiskProjectionRepository,
  PostgresMetricCatalogRepository,
  PostgresAnalyticsWarehouseRepository,
  PostgresAnalyticsQualityRepository,
  PostgresResearchExportJobRepository,
} from './index';

import {
  StudentDashboard,
  CompetencyAnalytics,
  LearningTrend,
  SnapshotVersion,
  ScheduledReport,
  StudentDashboardProjection,
  InstructorDashboardProjection,
  AdminDashboardProjection,
  WidgetDefinition,
  ReportDefinition,
  ReportExecution,
  ExportJob,
  TrendPoint,
} from '@clasptek/domain-learning-analytics';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';

let querySqls: string[] = [];

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, _params?: any[]) => {
    querySqls.push(sql);

    if (sql.includes('FROM analytics_dashboards')) {
      return {
        rows: [
          {
            id: 'dash-1',
            owner_id: 'owner-1',
            dashboard_type: sql.includes('STUDENT') ? 'STUDENT' : 'INSTRUCTOR',
            metadata: { isCustomized: true, cohortId: 'cohort-1' },
          },
        ],
      };
    }

    if (sql.includes('FROM snapshot_versions')) {
      return {
        rows: [
          {
            id: 'snap-1',
            generated_at: new Date().toISOString(),
            source_domains: ['StudentLearning'],
            schema_version: 'v1.0',
            aggregation_version: 'v1.1',
          },
        ],
      };
    }

    if (sql.includes('FROM learning_trends')) {
      return {
        rows: [
          {
            id: 'trend-1',
            category: 'StudyMinutes',
            trend_date: new Date().toISOString(),
            value: '45',
            direction: 'UPWARD',
          },
        ],
      };
    }

    if (sql.includes('FROM report_definitions')) {
      return {
        rows: [
          {
            id: 'def-1',
            code: 'WEEKLY_STATUS',
            name: 'Weekly Student Report',
            template_json: {},
          },
        ],
      };
    }

    if (sql.includes('FROM report_executions')) {
      return {
        rows: [
          {
            id: 'exec-1',
            report_definition_id: 'def-1',
            status: 'COMPLETED',
            executed_at: new Date().toISOString(),
            result_url: 'https://downloads.clasptek.com/reports/weekly_student_status.pdf',
          },
        ],
      };
    }

    if (sql.includes('FROM report_schedules')) {
      return {
        rows: [
          {
            id: 'sched-1',
            report_definition_id: 'def-1',
            recipient_email: 'test@clasptek.com',
            cron_expression: '0 9 * * 1',
            active: true,
          },
        ],
      };
    }

    if (sql.includes('FROM export_jobs')) {
      return {
        rows: [
          {
            id: 'export-1',
            format: 'CSV',
            status: 'COMPLETED',
            download_expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
            generated_by: 'admin-1',
            download_url: 'https://downloads.clasptek.com/exports/export.csv',
          },
        ],
      };
    }

    if (sql.includes('FROM widget_definitions')) {
      return {
        rows: [
          {
            id: 'widget-1',
            widget_type: 'READINESS_DIAL',
            display_name: 'Readiness Dial',
            default_config: {},
          },
        ],
      };
    }

    if (sql.includes('FROM student_analytics_dashboard_projections')) {
      return {
        rows: [
          {
            student_id: 'stud-1',
            profile_id: 'prof-1',
            readiness_score: '84.5',
            daily_plan: {},
            goal_completion: '75.0',
            study_streak: 5,
            practice_performance: {},
            assessment_history: {},
            coach_summary: {},
            prediction_trend: {},
            weak_competencies: {},
            recommended_actions: {},
            last_computed_at: new Date().toISOString(),
          },
        ],
      };
    }

    if (sql.includes('FROM instructor_dashboard_projections')) {
      return {
        rows: [
          {
            cohort_id: 'cohort-1',
            overview: {},
            risk_matrix: {},
            heatmap: {},
            completion_rates: {},
            quality_summary: {},
            predictions_dist: {},
            interventions: {},
            coach_engagement: {},
            top_performers: {},
            attention_needed: {},
            last_computed_at: new Date().toISOString(),
          },
        ],
      };
    }

    if (sql.includes('FROM admin_dashboard_projections')) {
      return {
        rows: [
          {
            org_id: 'org-1',
            platform_usage: {},
            dau: {},
            enrollments: {},
            completion_stats: {},
            ai_usage: {},
            prediction_accuracy: {},
            infrastructure: {},
            revenue: {},
            growth_trends: {},
            retention: {},
            last_computed_at: new Date().toISOString(),
          },
        ],
      };
    }

    if (sql.includes('FROM competency_projections')) {
      return {
        rows: [
          {
            competency_code: 'COMP-1',
            display_name: 'Grammar',
            mastery_distribution: {},
            average_score: '78.5',
            cohort_averages: {},
            last_computed_at: new Date().toISOString(),
          },
        ],
      };
    }

    if (sql.includes('FROM risk_projections')) {
      return {
        rows: [
          {
            student_id: 'stud-1',
            risk_level: 'HIGH',
            risk_score: '82.3',
            risk_factors: {},
            recommended_action: 'Practice now',
          },
        ],
      };
    }

    return { rows: [] };
  });

  const ClientMock = vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    query: queryMock,
    end: vi.fn(),
    on: vi.fn(),
  }));

  const PoolMock = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({
      query: queryMock,
      release: vi.fn(),
    }),
    query: queryMock,
    end: vi.fn(),
    on: vi.fn(),
  }));

  return { Client: ClientMock, Pool: PoolMock };
});

describe('Learning Analytics Postgres Repository Adapters', () => {
  let dbPool: DatabasePool;
  let logger: ConsoleLogger;

  beforeEach(async () => {
    querySqls = [];
    const env = loadEnvironment();
    logger = new ConsoleLogger('PersistenceTest');
    dbPool = new DatabasePool(env, logger);
    await dbPool.connect();
  });

  test('PostgresAnalyticsDashboardRepository saves and queries configurations', async () => {
    const repo = new PostgresAnalyticsDashboardRepository(dbPool);
    const studDash = new StudentDashboard({
      id: 'dash-1',
      studentId: 'stud-1',
      isCustomized: true,
    });
    await repo.saveStudent(studDash);
    expect(querySqls.some((s) => s.includes('INSERT INTO analytics_dashboards'))).toBe(true);

    const match = await repo.findStudentByStudentId('stud-1');
    expect(match?.studentId).toBe('owner-1');
  });

  test('PostgresAnalyticsSnapshotRepository saves snapshot version details', async () => {
    const repo = new PostgresAnalyticsSnapshotRepository(dbPool);
    const ver = SnapshotVersion.create(['StudentLearning'], 'v1', 'v2');
    await repo.saveVersion(ver);
    expect(querySqls.some((s) => s.includes('INSERT INTO snapshot_versions'))).toBe(true);

    const latest = await repo.findLatestVersion();
    expect(latest?.schemaVersion).toBe('v1.0');
  });

  test('PostgresTrendRepository saves points lists and queries trends', async () => {
    const repo = new PostgresTrendRepository(dbPool);
    const trend = LearningTrend.create('StudyMinutes');
    trend.addPoint(new TrendPoint(new Date(), 45));
    await repo.saveLearningTrend(trend);
    expect(querySqls.some((s) => s.includes('INSERT INTO learning_trends'))).toBe(true);

    const match = await repo.findLearningTrendByCategory('StudyMinutes');
    expect(match?.category).toBe('StudyMinutes');
  });

  test('PostgresReportRepository saves report configuration templates and executions', async () => {
    const repo = new PostgresReportRepository(dbPool);
    const def = new ReportDefinition({
      id: 'def-1',
      code: 'WEEKLY_STATUS',
      name: 'Weekly Status',
      templateJson: {},
    });
    await repo.saveDefinition(def);
    expect(querySqls.some((s) => s.includes('INSERT INTO report_definitions'))).toBe(true);

    const exec = new ReportExecution({
      id: 'exec-1',
      reportDefinitionId: 'def-1',
      status: 'COMPLETED',
      executedAt: new Date(),
    });
    await repo.saveExecution(exec);
    expect(querySqls.some((s) => s.includes('INSERT INTO report_executions'))).toBe(true);

    const sched = ScheduledReport.create('def-1', 'test@clasptek.com', '0 9 * * 1');
    await repo.saveSchedule(sched);
    expect(querySqls.some((s) => s.includes('INSERT INTO report_schedules'))).toBe(true);
  });

  test('PostgresExportRepository saves and fetches exported file status', async () => {
    const repo = new PostgresExportRepository(dbPool);
    const job = new ExportJob({
      id: 'job-1',
      format: 'CSV',
      status: 'COMPLETED',
      downloadExpiry: new Date(),
      generatedBy: 'admin-1',
    });
    await repo.saveJob(job);
    expect(querySqls.some((s) => s.includes('INSERT INTO export_jobs'))).toBe(true);

    const match = await repo.findJobById('job-1');
    expect(match?.status).toBe('COMPLETED');
  });

  test('PostgresWidgetRepository maps layout plugins', async () => {
    const repo = new PostgresWidgetRepository(dbPool);
    const def = new WidgetDefinition({
      id: 'widget-1',
      widgetType: 'READINESS_DIAL',
      displayName: 'Readiness',
      defaultConfig: {},
    });
    await repo.saveDefinition(def);
    expect(querySqls.some((s) => s.includes('INSERT INTO widget_definitions'))).toBe(true);

    const match = await repo.findDefinitionByType('READINESS_DIAL');
    expect(match?.widgetType).toBe('READINESS_DIAL');
  });

  test('PostgresStudentDashboardProjectionRepository saves student projections', async () => {
    const repo = new PostgresStudentDashboardProjectionRepository(dbPool);
    const proj = new StudentDashboardProjection({
      studentId: 'stud-1',
      profileId: 'prof-1',
      readinessScore: 84.5,
    });
    await repo.save(proj);
    expect(
      querySqls.some((s) => s.includes('INSERT INTO student_analytics_dashboard_projections'))
    ).toBe(true);

    const match = await repo.find('stud-1', 'prof-1');
    expect(match?.readinessScore).toBe(84.5);
  });

  test('PostgresInstructorDashboardProjectionRepository maps cohort indices views', async () => {
    const repo = new PostgresInstructorDashboardProjectionRepository(dbPool);
    const proj = new InstructorDashboardProjection({
      cohortId: 'cohort-1',
      overview: {},
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
    await repo.save(proj);
    expect(querySqls.some((s) => s.includes('INSERT INTO instructor_dashboard_projections'))).toBe(
      true
    );

    const match = await repo.find('cohort-1');
    expect(match?.cohortId).toBe('cohort-1');
  });

  test('PostgresAdminDashboardProjectionRepository saves platform active metrics projections', async () => {
    const repo = new PostgresAdminDashboardProjectionRepository(dbPool);
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
    await repo.save(proj);
    expect(querySqls.some((s) => s.includes('INSERT INTO admin_dashboard_projections'))).toBe(true);

    const match = await repo.find('org-1');
    expect(match?.orgId).toBe('org-1');
  });

  test('PostgresCompetencyProjectionRepository records competencies distribution', async () => {
    const repo = new PostgresCompetencyProjectionRepository(dbPool);
    const proj = CompetencyAnalytics.create('COMP-1', 'Grammar', 78.5);
    await repo.save(proj);
    expect(querySqls.some((s) => s.includes('INSERT INTO competency_projections'))).toBe(true);

    const match = await repo.find('COMP-1');
    expect(match?.averageScore).toBe(78.5);
  });

  test('PostgresRiskProjectionRepository stores risk score recommendations', async () => {
    const repo = new PostgresRiskProjectionRepository(dbPool);
    await repo.save('stud-1', 'HIGH', 82.3, {}, 'Practice now');
    expect(querySqls.some((s) => s.includes('INSERT INTO risk_projections'))).toBe(true);

    const match = await repo.find('stud-1');
    expect(match?.riskLevel).toBe('HIGH');
  });

  test('PostgresMetricCatalogRepository manages metric catalog persistence', async () => {
    const repo = new PostgresMetricCatalogRepository(dbPool);
    const catalog = {
      listMetrics: () => [
        {
          id: 'm1',
          code: { value: 'RETENTION' },
          name: 'Retention Rate',
          businessDefinition: '30-day retention percentage',
          owner: { team: 'Ops', email: 'ops@clasptek.com' },
          refreshPolicy: { policyType: 'DAILY' },
          currentVersion: { version: 'v1.0' },
          status: 'ACTIVE',
        },
      ],
    };
    await repo.saveCatalog(catalog);
    expect(querySqls.some((s) => s.includes('INSERT INTO analytics_metric_catalog'))).toBe(true);
  });

  test('PostgresAnalyticsWarehouseRepository manages warehouse projections', async () => {
    const repo = new PostgresAnalyticsWarehouseRepository(dbPool);
    await repo.saveProjection('kpi_summary', { totalUsers: 1500 });
    expect(querySqls.some((s) => s.includes('INSERT INTO analytics_warehouse_projections'))).toBe(
      true
    );

    const res = await repo.refreshMaterializedViews();
    expect(res.refreshedCount).toBe(4);
  });

  test('PostgresAnalyticsQualityRepository logs data quality checks', async () => {
    const repo = new PostgresAnalyticsQualityRepository(dbPool);
    await repo.logDataQualityCheck('EventIngestion', 'PASSED', 'Zero missing events');
    expect(querySqls.some((s) => s.includes('INSERT INTO analytics_quality_checks'))).toBe(true);
  });

  test('PostgresResearchExportJobRepository handles export jobs', async () => {
    const repo = new PostgresResearchExportJobRepository(dbPool);
    const job = {
      id: 'job-100',
      requestedBy: 'researcher-1',
      datasetType: 'READINESS',
      status: 'READY',
      isAnonymized: true,
      recordCount: 1500,
      fileUrl: 'https://downloads.clasptek.com/export.csv',
      requestedAt: new Date(),
      completedAt: new Date(),
      failureReason: undefined,
    };
    await repo.saveJob(job);
    expect(querySqls.some((s) => s.includes('INSERT INTO analytics_research_export_jobs'))).toBe(
      true
    );
  });
});
