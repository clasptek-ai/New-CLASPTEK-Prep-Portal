import { Entity } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════════
// DOMAIN EVENTS
// ═══════════════════════════════════════════════════════════════════════
export abstract class BaseAnalyticsEvent {
  public readonly eventId = randomUUID();
  public readonly occurredAt = new Date();
}

export class DashboardGenerated extends BaseAnalyticsEvent {
  constructor(
    public readonly dashboardId: string,
    public readonly dashboardType: string
  ) {
    super();
  }
}

export class AnalyticsRefreshed extends BaseAnalyticsEvent {
  constructor(
    public readonly jobId: string,
    public readonly status: string
  ) {
    super();
  }
}

export class ReportGenerated extends BaseAnalyticsEvent {
  constructor(
    public readonly reportId: string,
    public readonly definitionCode: string
  ) {
    super();
  }
}

export class TrendCalculated extends BaseAnalyticsEvent {
  constructor(
    public readonly trendId: string,
    public readonly category: string
  ) {
    super();
  }
}

export class SnapshotCreated extends BaseAnalyticsEvent {
  constructor(
    public readonly snapshotId: string,
    public readonly version: string
  ) {
    super();
  }
}

export class ExportCompleted extends BaseAnalyticsEvent {
  constructor(
    public readonly exportId: string,
    public readonly format: string
  ) {
    super();
  }
}

export class ScheduledReportExecuted extends BaseAnalyticsEvent {
  constructor(
    public readonly scheduleId: string,
    public readonly executedAt: Date
  ) {
    super();
  }
}

export class MetricCalculated extends BaseAnalyticsEvent {
  constructor(
    public readonly metricCode: string,
    public readonly value: number,
    public readonly calculatedAt: Date
  ) {
    super();
  }
}

export class WarehouseUpdated extends BaseAnalyticsEvent {
  constructor(
    public readonly warehouseVersion: string,
    public readonly snapshotCount: number
  ) {
    super();
  }
}

export class DataQualityDetected extends BaseAnalyticsEvent {
  constructor(
    public readonly issueType: string,
    public readonly severity: 'INFO' | 'WARNING' | 'CRITICAL',
    public readonly details: string
  ) {
    super();
  }
}

export class BenchmarkCompleted extends BaseAnalyticsEvent {
  constructor(
    public readonly benchmarkId: string,
    public readonly category: string,
    public readonly percentile: number
  ) {
    super();
  }
}

export class PredictionGenerated extends BaseAnalyticsEvent {
  constructor(
    public readonly modelVersion: string,
    public readonly targetStudentId: string,
    public readonly predictedScore: number
  ) {
    super();
  }
}

export class ExecutiveInsightPublished extends BaseAnalyticsEvent {
  constructor(
    public readonly insightId: string,
    public readonly category: string,
    public readonly title: string
  ) {
    super();
  }
}

export class ResearchExportCompleted extends BaseAnalyticsEvent {
  constructor(
    public readonly jobId: string,
    public readonly recordCount: number,
    public readonly isAnonymized: boolean
  ) {
    super();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════════
export class MetricValue {
  constructor(
    public readonly value: number,
    public readonly status: 'NORMAL' | 'ALERT' | 'CRITICAL'
  ) {}
}

export class CompletionRate {
  constructor(
    public readonly completed: number,
    public readonly total: number
  ) {}
  get rate(): number {
    return this.total > 0 ? (this.completed / this.total) * 100 : 0;
  }
}

export class CompetencyScore {
  constructor(
    public readonly competencyCode: string,
    public readonly score: number
  ) {}
}

export type TrendDirection = 'UPWARD' | 'DOWNWARD' | 'STABLE';

export class GrowthRate {
  constructor(
    public readonly currentPeriodValue: number,
    public readonly priorPeriodValue: number
  ) {}
  get percentChange(): number {
    if (this.priorPeriodValue === 0) return 0;
    return ((this.currentPeriodValue - this.priorPeriodValue) / this.priorPeriodValue) * 100;
  }
}

export class RiskDistribution {
  constructor(
    public readonly highRiskPercent: number,
    public readonly mediumRiskPercent: number,
    public readonly lowRiskPercent: number
  ) {}
}

export class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
  }
}

export class DashboardFilter {
  constructor(
    public readonly dateRange?: DateRange,
    public readonly cohortId?: string,
    public readonly limit?: number
  ) {}
}

export class ChartConfiguration {
  constructor(
    public readonly chartType: 'LINE' | 'BAR' | 'PIE' | 'HEATMAP',
    public readonly colors: string[],
    public readonly legendVisible: boolean
  ) {}
}

// ═══════════════════════════════════════════════════════════════════════
// ENTITIES & SUPPORTING MODELS
// ═══════════════════════════════════════════════════════════════════════
export class WidgetDefinition extends Entity<string> {
  public widgetType: string;
  public displayName: string;
  public defaultConfig: Record<string, any>;

  constructor(props: {
    id: string;
    widgetType: string;
    displayName: string;
    defaultConfig: Record<string, any>;
  }) {
    super(props.id);
    this.widgetType = props.widgetType;
    this.displayName = props.displayName;
    this.defaultConfig = props.defaultConfig;
  }
}

export class WidgetInstance extends Entity<string> {
  public dashboardId: string;
  public widgetDefinitionId: string;
  public title: string;
  public layoutGrid: { x: number; y: number; w: number; h: number };
  public configuration: Record<string, any>;

  constructor(props: {
    id: string;
    dashboardId: string;
    widgetDefinitionId: string;
    title: string;
    layoutGrid: { x: number; y: number; w: number; h: number };
    configuration: Record<string, any>;
  }) {
    super(props.id);
    this.dashboardId = props.dashboardId;
    this.widgetDefinitionId = props.widgetDefinitionId;
    this.title = props.title;
    this.layoutGrid = props.layoutGrid;
    this.configuration = props.configuration;
  }
}

export class TrendPoint {
  constructor(
    public readonly date: Date,
    public readonly value: number
  ) {}
}

export class MetricCard {
  constructor(
    public readonly title: string,
    public readonly value: string,
    public readonly indicator?: string
  ) {}
}

export class PerformanceIndicator {
  constructor(
    public readonly alertType: 'INFO' | 'WARNING' | 'DANGER',
    public readonly message: string
  ) {}
}

export class HeatMap {
  constructor(public readonly gridData: Array<{ x: string; y: string; val: number }>) {}
}

export class Leaderboard {
  constructor(public readonly entries: Array<{ rank: number; name: string; score: number }>) {}
}

export class PredictionTrend extends Entity<string> {
  public modelVersion: string;
  public measuredDate: Date;
  public accuracyRate: number;
  public mae: number;
  public totalPredictions: number;

  constructor(props: {
    id: string;
    modelVersion: string;
    measuredDate: Date;
    accuracyRate: number;
    mae: number;
    totalPredictions: number;
  }) {
    super(props.id);
    this.modelVersion = props.modelVersion;
    this.measuredDate = props.measuredDate;
    this.accuracyRate = props.accuracyRate;
    this.mae = props.mae;
    this.totalPredictions = props.totalPredictions;
  }
}

export class CoachUsage extends Entity<string> {
  public coachId: string;
  public totalSessions: number;
  public totalMessages: number;
  public averageResponseTokens: number;
  public satisfactionScore: number | undefined;
  public lastActiveAt: Date | undefined;

  constructor(props: {
    id: string;
    coachId: string;
    totalSessions: number;
    totalMessages: number;
    averageResponseTokens: number;
    satisfactionScore?: number;
    lastActiveAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.totalSessions = props.totalSessions;
    this.totalMessages = props.totalMessages;
    this.averageResponseTokens = props.averageResponseTokens;
    this.satisfactionScore = props.satisfactionScore;
    this.lastActiveAt = props.lastActiveAt;
  }
}

export class AssessmentTrend extends Entity<string> {
  public cohortId: string;
  public totalSubmissions: number;
  public averageScore: number;
  public passRate: number;
  public completionRate: number;

  constructor(props: {
    id: string;
    cohortId: string;
    totalSubmissions: number;
    averageScore: number;
    passRate: number;
    completionRate: number;
  }) {
    super(props.id);
    this.cohortId = props.cohortId;
    this.totalSubmissions = props.totalSubmissions;
    this.averageScore = props.averageScore;
    this.passRate = props.passRate;
    this.completionRate = props.completionRate;
  }
}

export class PracticeTrend extends Entity<string> {
  public cohortId: string;
  public totalPracticeSessions: number;
  public averageScore: number;
  public accuracyRate: number;
  public timeSpentSeconds: number;

  constructor(props: {
    id: string;
    cohortId: string;
    totalPracticeSessions: number;
    averageScore: number;
    accuracyRate: number;
    timeSpentSeconds: number;
  }) {
    super(props.id);
    this.cohortId = props.cohortId;
    this.totalPracticeSessions = props.totalPracticeSessions;
    this.averageScore = props.averageScore;
    this.accuracyRate = props.accuracyRate;
    this.timeSpentSeconds = props.timeSpentSeconds;
  }
}

export class ExportJob extends Entity<string> {
  public format: 'CSV' | 'PDF' | 'EXCEL';
  public status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  public downloadExpiry: Date;
  public generatedBy: string;
  public downloadUrl: string | undefined;

  constructor(props: {
    id: string;
    format: 'CSV' | 'PDF' | 'EXCEL';
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    downloadExpiry: Date;
    generatedBy: string;
    downloadUrl?: string;
  }) {
    super(props.id);
    this.format = props.format;
    this.status = props.status;
    this.downloadExpiry = props.downloadExpiry;
    this.generatedBy = props.generatedBy;
    this.downloadUrl = props.downloadUrl;
  }
}

export class ReportDefinition extends Entity<string> {
  public code: string;
  public name: string;
  public templateJson: Record<string, any>;

  constructor(props: {
    id: string;
    code: string;
    name: string;
    templateJson: Record<string, any>;
  }) {
    super(props.id);
    this.code = props.code;
    this.name = props.name;
    this.templateJson = props.templateJson;
  }
}

export class ReportExecution extends Entity<string> {
  public reportDefinitionId: string;
  public status: 'PENDING' | 'COMPLETED' | 'FAILED';
  public executedAt: Date;
  public resultUrl: string | undefined;
  public errorLog: string | undefined;

  constructor(props: {
    id: string;
    reportDefinitionId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    executedAt: Date;
    resultUrl?: string;
    errorLog?: string;
  }) {
    super(props.id);
    this.reportDefinitionId = props.reportDefinitionId;
    this.status = props.status;
    this.executedAt = props.executedAt;
    this.resultUrl = props.resultUrl;
    this.errorLog = props.errorLog;
  }
}

export class ReportResult {
  constructor(
    public readonly url: string,
    public readonly sizeBytes: number
  ) {}
}

export class AnalyticsSource extends Entity<string> {
  public sourceDomain:
    | 'StudentLearning'
    | 'AssessmentRuntime'
    | 'Evaluation'
    | 'Prediction'
    | 'LearningAssistant'
    | 'AdaptivePractice'
    | 'Curriculum'
    | 'QuestionBank';
  public metricCode: string;
  public lastSyncAt: Date;

  constructor(props: {
    id: string;
    sourceDomain:
      | 'StudentLearning'
      | 'AssessmentRuntime'
      | 'Evaluation'
      | 'Prediction'
      | 'LearningAssistant'
      | 'AdaptivePractice'
      | 'Curriculum'
      | 'QuestionBank';
    metricCode: string;
    lastSyncAt: Date;
  }) {
    super(props.id);
    this.sourceDomain = props.sourceDomain;
    this.metricCode = props.metricCode;
    this.lastSyncAt = props.lastSyncAt;
  }
}

export class AnalyticsValidation extends Entity<string> {
  public runDate: Date;
  public validationType:
    'Missing Data' | 'Late Data' | 'Outliers' | 'Schema Drift' | 'Duplicate Metrics';
  public details: Record<string, any>;
  public status: 'PASSED' | 'WARNING' | 'FAILED';
  public checkedAt: Date;

  constructor(props: {
    id: string;
    runDate: Date;
    validationType:
      'Missing Data' | 'Late Data' | 'Outliers' | 'Schema Drift' | 'Duplicate Metrics';
    details: Record<string, any>;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    checkedAt: Date;
  }) {
    super(props.id);
    this.runDate = props.runDate;
    this.validationType = props.validationType;
    this.details = props.details;
    this.status = props.status;
    this.checkedAt = props.checkedAt;
  }
}

export class StudentAnalytics {
  constructor(
    public readonly studentId: string,
    public readonly overallReadiness: number,
    public readonly cohortAverageReadiness: number,
    public readonly recentScores: number[]
  ) {}
}

export class InstructorAnalytics {
  constructor(
    public readonly instructorId: string,
    public readonly activeCohorts: string[],
    public readonly averageClassMastery: number
  ) {}
}

export class AdminAnalytics {
  constructor(
    public readonly totalRegisteredUsers: number,
    public readonly dau: number,
    public readonly predictionAccuracy: number
  ) {}
}

// ═══════════════════════════════════════════════════════════════════════
// AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════════
export class StudentDashboard extends Entity<string> {
  public studentId: string;
  public widgets: WidgetInstance[];
  public isCustomized: boolean;

  constructor(props: {
    id: string;
    studentId: string;
    widgets?: WidgetInstance[];
    isCustomized?: boolean;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.widgets = props.widgets ?? [];
    this.isCustomized = props.isCustomized ?? false;
  }

  public static create(studentId: string): StudentDashboard {
    return new StudentDashboard({ id: randomUUID(), studentId });
  }

  public addWidget(widget: WidgetInstance): void {
    this.widgets.push(widget);
  }
}

export class InstructorDashboard extends Entity<string> {
  public instructorId: string;
  public cohortId: string;
  public widgets: WidgetInstance[];

  constructor(props: {
    id: string;
    instructorId: string;
    cohortId: string;
    widgets?: WidgetInstance[];
  }) {
    super(props.id);
    this.instructorId = props.instructorId;
    this.cohortId = props.cohortId;
    this.widgets = props.widgets ?? [];
  }

  public static create(instructorId: string, cohortId: string): InstructorDashboard {
    return new InstructorDashboard({ id: randomUUID(), instructorId, cohortId });
  }
}

export class AdminDashboard extends Entity<string> {
  public orgId: string;
  public widgets: WidgetInstance[];

  constructor(props: { id: string; orgId: string; widgets?: WidgetInstance[] }) {
    super(props.id);
    this.orgId = props.orgId;
    this.widgets = props.widgets ?? [];
  }

  public static create(orgId: string): AdminDashboard {
    return new AdminDashboard({ id: randomUUID(), orgId });
  }
}

export class CohortAnalytics extends Entity<string> {
  public cohortId: string;
  public averageReadiness: number;
  public riskDistribution: RiskDistribution;
  public averageStudyMinutes: number;
  public assessmentAverages: Record<string, number>;

  constructor(props: {
    id: string;
    cohortId: string;
    averageReadiness: number;
    riskDistribution: RiskDistribution;
    averageStudyMinutes: number;
    assessmentAverages: Record<string, number>;
  }) {
    super(props.id);
    this.cohortId = props.cohortId;
    this.averageReadiness = props.averageReadiness;
    this.riskDistribution = props.riskDistribution;
    this.averageStudyMinutes = props.averageStudyMinutes;
    this.assessmentAverages = props.assessmentAverages;
  }

  public static create(
    cohortId: string,
    averageReadiness: number,
    riskDist: RiskDistribution,
    avgStudy: number
  ): CohortAnalytics {
    return new CohortAnalytics({
      id: randomUUID(),
      cohortId,
      averageReadiness,
      riskDistribution: riskDist,
      averageStudyMinutes: avgStudy,
      assessmentAverages: {},
    });
  }
}

export class CompetencyAnalytics extends Entity<string> {
  public competencyCode: string;
  public displayName: string;
  public masteryDistribution: Record<string, number>;
  public averageScore: number;
  public cohortAverages: Record<string, number>;

  constructor(props: {
    id: string;
    competencyCode: string;
    displayName: string;
    masteryDistribution: Record<string, number>;
    averageScore: number;
    cohortAverages: Record<string, number>;
  }) {
    super(props.id);
    this.competencyCode = props.competencyCode;
    this.displayName = props.displayName;
    this.masteryDistribution = props.masteryDistribution;
    this.averageScore = props.averageScore;
    this.cohortAverages = props.cohortAverages;
  }

  public static create(
    competencyCode: string,
    displayName: string,
    averageScore: number
  ): CompetencyAnalytics {
    return new CompetencyAnalytics({
      id: randomUUID(),
      competencyCode,
      displayName,
      masteryDistribution: {},
      averageScore,
      cohortAverages: {},
    });
  }
}

export class LearningTrend extends Entity<string> {
  public category: string;
  public trendPoints: TrendPoint[];
  public direction: TrendDirection;

  constructor(props: {
    id: string;
    category: string;
    trendPoints?: TrendPoint[];
    direction?: TrendDirection;
  }) {
    super(props.id);
    this.category = props.category;
    this.trendPoints = props.trendPoints ?? [];
    this.direction = props.direction ?? 'STABLE';
  }

  public static create(category: string): LearningTrend {
    return new LearningTrend({ id: randomUUID(), category });
  }

  public addPoint(point: TrendPoint): void {
    this.trendPoints.push(point);
    this._recalculateDirection();
  }

  private _recalculateDirection(): void {
    if (this.trendPoints.length < 2) {
      this.direction = 'STABLE';
      return;
    }
    const first = this.trendPoints[0].value;
    const last = this.trendPoints[this.trendPoints.length - 1].value;
    if (last > first) this.direction = 'UPWARD';
    else if (last < first) this.direction = 'DOWNWARD';
    else this.direction = 'STABLE';
  }
}

export class SnapshotVersion extends Entity<string> {
  public generatedAt: Date;
  public sourceDomains: string[];
  public schemaVersion: string;
  public aggregationVersion: string;

  constructor(props: {
    id: string;
    generatedAt: Date;
    sourceDomains: string[];
    schemaVersion: string;
    aggregationVersion: string;
  }) {
    super(props.id);
    this.generatedAt = props.generatedAt;
    this.sourceDomains = props.sourceDomains;
    this.schemaVersion = props.schemaVersion;
    this.aggregationVersion = props.aggregationVersion;
  }

  public static create(
    sourceDomains: string[],
    schemaVer: string,
    aggVer: string
  ): SnapshotVersion {
    return new SnapshotVersion({
      id: randomUUID(),
      generatedAt: new Date(),
      sourceDomains,
      schemaVersion: schemaVer,
      aggregationVersion: aggVer,
    });
  }
}

export class ScheduledReport extends Entity<string> {
  public reportDefinitionId: string;
  public recipientEmail: string;
  public cronExpression: string;
  public active: boolean;

  constructor(props: {
    id: string;
    reportDefinitionId: string;
    recipientEmail: string;
    cronExpression: string;
    active?: boolean;
  }) {
    super(props.id);
    this.reportDefinitionId = props.reportDefinitionId;
    this.recipientEmail = props.recipientEmail;
    this.cronExpression = props.cronExpression;
    this.active = props.active ?? true;
  }

  public static create(reportDefinitionId: string, email: string, cron: string): ScheduledReport {
    return new ScheduledReport({
      id: randomUUID(),
      reportDefinitionId,
      recipientEmail: email,
      cronExpression: cron,
    });
  }
}

export class LegacyMetricDefinition extends Entity<string> {
  public code: string;
  public displayName: string;
  public formula: string;
  public owner: string;
  public refreshFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  public unit: string;
  public target: string;

  constructor(props: {
    id: string;
    code: string;
    displayName: string;
    formula: string;
    owner: string;
    refreshFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    unit: string;
    target: string;
  }) {
    super(props.id);
    this.code = props.code;
    this.displayName = props.displayName;
    this.formula = props.formula;
    this.owner = props.owner;
    this.refreshFrequency = props.refreshFrequency;
    this.unit = props.unit;
    this.target = props.target;
  }
}

export class AnalyticsJob extends Entity<string> {
  public status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  public startedAt: Date;
  public completedAt: Date | undefined;
  public duration: number | undefined;
  public initiatedBy: string;
  public trigger: 'MANUAL' | 'SCHEDULED' | 'EVENT';
  public retryCount: number;
  public error: string | undefined;

  constructor(props: {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    initiatedBy: string;
    trigger: 'MANUAL' | 'SCHEDULED' | 'EVENT';
    retryCount: number;
    error?: string;
  }) {
    super(props.id);
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.duration = props.duration;
    this.initiatedBy = props.initiatedBy;
    this.trigger = props.trigger;
    this.retryCount = props.retryCount;
    this.error = props.error;
  }

  public static create(
    initiatedBy: string,
    trigger: 'MANUAL' | 'SCHEDULED' | 'EVENT'
  ): AnalyticsJob {
    return new AnalyticsJob({
      id: randomUUID(),
      status: 'PENDING',
      startedAt: new Date(),
      initiatedBy,
      trigger,
      retryCount: 0,
    });
  }

  public complete(): void {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
    this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
  }

  public fail(error: string): void {
    this.status = 'FAILED';
    this.completedAt = new Date();
    this.error = error;
    this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ANALYTICS PROJECTIONS (READ MODEL BOUNDARY)
// ═══════════════════════════════════════════════════════════════════════
export class StudentDashboardProjection extends Entity<string> {
  public studentId: string;
  public profileId: string;
  public readinessScore: number | undefined;
  public dailyPlan: Record<string, any> | undefined;
  public goalCompletion: number | undefined;
  public studyStreak: number | undefined;
  public practicePerformance: Record<string, any> | undefined;
  public assessmentHistory: Record<string, any> | undefined;
  public coachSummary: Record<string, any> | undefined;
  public predictionTrend: Record<string, any> | undefined;
  public weakCompetencies: Record<string, any> | undefined;
  public recommendedActions: Record<string, any> | undefined;
  public lastComputedAt: Date;

  constructor(props: {
    studentId: string;
    profileId: string;
    readinessScore?: number | undefined;
    dailyPlan?: Record<string, any> | undefined;
    goalCompletion?: number | undefined;
    studyStreak?: number | undefined;
    practicePerformance?: Record<string, any> | undefined;
    assessmentHistory?: Record<string, any> | undefined;
    coachSummary?: Record<string, any> | undefined;
    predictionTrend?: Record<string, any> | undefined;
    weakCompetencies?: Record<string, any> | undefined;
    recommendedActions?: Record<string, any> | undefined;
    lastComputedAt?: Date | undefined;
  }) {
    super(`${props.studentId}-${props.profileId}`);
    this.studentId = props.studentId;
    this.profileId = props.profileId;
    this.readinessScore = props.readinessScore;
    this.dailyPlan = props.dailyPlan;
    this.goalCompletion = props.goalCompletion;
    this.studyStreak = props.studyStreak;
    this.practicePerformance = props.practicePerformance;
    this.assessmentHistory = props.assessmentHistory;
    this.coachSummary = props.coachSummary;
    this.predictionTrend = props.predictionTrend;
    this.weakCompetencies = props.weakCompetencies;
    this.recommendedActions = props.recommendedActions;
    this.lastComputedAt = props.lastComputedAt ?? new Date();
  }
}

export class InstructorDashboardProjection extends Entity<string> {
  public cohortId: string;
  public overview: Record<string, any>;
  public riskMatrix: Record<string, any>;
  public heatmap: Record<string, any>;
  public completionRates: Record<string, any>;
  public qualitySummary: Record<string, any>;
  public predictionsDist: Record<string, any>;
  public interventions: Record<string, any>;
  public coachEngagement: Record<string, any>;
  public topPerformers: Record<string, any>;
  public attentionNeeded: Record<string, any>;
  public lastComputedAt: Date;

  constructor(props: {
    cohortId: string;
    overview: Record<string, any>;
    riskMatrix: Record<string, any>;
    heatmap: Record<string, any>;
    completionRates: Record<string, any>;
    qualitySummary: Record<string, any>;
    predictionsDist: Record<string, any>;
    interventions: Record<string, any>;
    coachEngagement: Record<string, any>;
    topPerformers: Record<string, any>;
    attentionNeeded: Record<string, any>;
    lastComputedAt?: Date;
  }) {
    super(props.cohortId);
    this.cohortId = props.cohortId;
    this.overview = props.overview;
    this.riskMatrix = props.riskMatrix;
    this.heatmap = props.heatmap;
    this.completionRates = props.completionRates;
    this.qualitySummary = props.qualitySummary;
    this.predictionsDist = props.predictionsDist;
    this.interventions = props.interventions;
    this.coachEngagement = props.coachEngagement;
    this.topPerformers = props.topPerformers;
    this.attentionNeeded = props.attentionNeeded;
    this.lastComputedAt = props.lastComputedAt ?? new Date();
  }
}

export class AdminDashboardProjection extends Entity<string> {
  public orgId: string;
  public platformUsage: Record<string, any>;
  public dau: Record<string, any>;
  public enrollments: Record<string, any>;
  public completionStats: Record<string, any>;
  public aiUsage: Record<string, any>;
  public predictionAccuracy: Record<string, any>;
  public infrastructure: Record<string, any>;
  public revenue: Record<string, any>;
  public growthTrends: Record<string, any>;
  public retention: Record<string, any>;
  public lastComputedAt: Date;

  constructor(props: {
    orgId: string;
    platformUsage: Record<string, any>;
    dau: Record<string, any>;
    enrollments: Record<string, any>;
    completionStats: Record<string, any>;
    aiUsage: Record<string, any>;
    predictionAccuracy: Record<string, any>;
    infrastructure: Record<string, any>;
    revenue: Record<string, any>;
    growthTrends: Record<string, any>;
    retention: Record<string, any>;
    lastComputedAt?: Date;
  }) {
    super(props.orgId);
    this.orgId = props.orgId;
    this.platformUsage = props.platformUsage;
    this.dau = props.dau;
    this.enrollments = props.enrollments;
    this.completionStats = props.completionStats;
    this.aiUsage = props.aiUsage;
    this.predictionAccuracy = props.predictionAccuracy;
    this.infrastructure = props.infrastructure;
    this.revenue = props.revenue;
    this.growthTrends = props.growthTrends;
    this.retention = props.retention;
    this.lastComputedAt = props.lastComputedAt ?? new Date();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DETACHED ENGINES
// ═══════════════════════════════════════════════════════════════════════
export interface DashboardAggregationEngine {
  aggregateStudent(
    studentId: string,
    profileId: string,
    context: Record<string, any>
  ): Promise<StudentDashboardProjection>;
  aggregateInstructor(
    cohortId: string,
    context: Record<string, any>
  ): Promise<InstructorDashboardProjection>;
  aggregateAdmin(orgId: string, context: Record<string, any>): Promise<AdminDashboardProjection>;
}

export interface CompetencyTrendEngine {
  calculateCompetencyTrend(
    competencyCode: string,
    range: DateRange,
    data: any[]
  ): Promise<LearningTrend>;
}

export interface PredictionTrendEngine {
  calculatePredictionTrend(
    modelVersion: string,
    range: DateRange,
    data: any[]
  ): Promise<PredictionTrend>;
}

export interface CoachTrendEngine {
  calculateCoachTrend(coachId: string, range: DateRange, data: any[]): Promise<CoachUsage>;
}

export interface PracticeTrendEngine {
  calculatePracticeTrend(cohortId: string, range: DateRange, data: any[]): Promise<PracticeTrend>;
}

export interface PlatformTrendEngine {
  calculatePlatformTrend(range: DateRange, data: any[]): Promise<LearningTrend>;
}

export interface CompetencyAnalyticsEngine {
  analyzeCompetency(competencyCode: string, data: any[]): Promise<CompetencyAnalytics>;
}

export interface InstructorInsightEngine {
  generateInsights(cohortId: string, data: any[]): Promise<Record<string, any>>;
}

export interface PlatformMetricsEngine {
  calculateKPIs(date: Date, data: any[]): Promise<Record<string, any>>;
}

export interface ExportEngine {
  generateExport(job: ExportJob, data: any[]): Promise<ReportResult>;
}

// ═══════════════════════════════════════════════════════════════════════
// CONCRETE STUB IMPLEMENTATIONS FOR DOMAIN ENGINES
// ═══════════════════════════════════════════════════════════════════════
export class RuleBasedDashboardAggregationEngine implements DashboardAggregationEngine {
  async aggregateStudent(
    studentId: string,
    profileId: string,
    _context: Record<string, any>
  ): Promise<StudentDashboardProjection> {
    return new StudentDashboardProjection({
      studentId,
      profileId,
      readinessScore: 82.5,
      dailyPlan: { totalMinutes: 45, completedMinutes: 30 },
      goalCompletion: 75.0,
      studyStreak: 5,
      practicePerformance: { correctCount: 15, totalCount: 20 },
      assessmentHistory: [],
      coachSummary: { lastMessage: 'Well done today!' },
      predictionTrend: [80, 81, 82.5],
      weakCompetencies: ['VOCABULARY_ADVANCED'],
      recommendedActions: ['Practice Vocabulary'],
    });
  }

  async aggregateInstructor(
    cohortId: string,
    _context: Record<string, any>
  ): Promise<InstructorDashboardProjection> {
    return new InstructorDashboardProjection({
      cohortId,
      overview: { totalStudents: 25, activeStudents: 22 },
      riskMatrix: { highRisk: 2, mediumRisk: 5, lowRisk: 18 },
      heatmap: [],
      completionRates: { homework: 85, mockExams: 90 },
      qualitySummary: {},
      predictionsDist: { ready: 15, borderline: 8, notReady: 2 },
      interventions: { active: 3, resolved: 10 },
      coachEngagement: { high: 10, medium: 12, low: 3 },
      topPerformers: [],
      attentionNeeded: [],
    });
  }

  async aggregateAdmin(
    orgId: string,
    _context: Record<string, any>
  ): Promise<AdminDashboardProjection> {
    return new AdminDashboardProjection({
      orgId,
      platformUsage: { activeLicences: 500, totalLicences: 600 },
      dau: { activeToday: 320 },
      enrollments: { total: 480 },
      completionStats: { rate: 88.5 },
      aiUsage: { totalTokensConsumed: 1200000 },
      predictionAccuracy: { rate: 87.2 },
      infrastructure: { status: 'HEALTHY', latencyMs: 120 },
      revenue: { mrr: 15000 },
      growthTrends: [],
      retention: { rate: 94.5 },
    });
  }
}

export class DefaultCompetencyTrendEngine implements CompetencyTrendEngine {
  async calculateCompetencyTrend(
    competencyCode: string,
    _range: DateRange,
    _data: any[]
  ): Promise<LearningTrend> {
    const trend = LearningTrend.create(competencyCode);
    trend.addPoint(new TrendPoint(new Date(), 70));
    trend.addPoint(new TrendPoint(new Date(), 75));
    return trend;
  }
}

export class DefaultPredictionTrendEngine implements PredictionTrendEngine {
  async calculatePredictionTrend(
    modelVersion: string,
    _range: DateRange,
    _data: any[]
  ): Promise<PredictionTrend> {
    return new PredictionTrend({
      id: randomUUID(),
      modelVersion,
      measuredDate: new Date(),
      accuracyRate: 88.5,
      mae: 0.12,
      totalPredictions: 450,
    });
  }
}

export class DefaultCoachTrendEngine implements CoachTrendEngine {
  async calculateCoachTrend(coachId: string, _range: DateRange, _data: any[]): Promise<CoachUsage> {
    return new CoachUsage({
      id: randomUUID(),
      coachId,
      totalSessions: 14,
      totalMessages: 98,
      averageResponseTokens: 180,
      satisfactionScore: 4.8,
      lastActiveAt: new Date(),
    });
  }
}

export class DefaultPracticeTrendEngine implements PracticeTrendEngine {
  async calculatePracticeTrend(
    cohortId: string,
    _range: DateRange,
    _data: any[]
  ): Promise<PracticeTrend> {
    return new PracticeTrend({
      id: randomUUID(),
      cohortId,
      totalPracticeSessions: 120,
      averageScore: 78.4,
      accuracyRate: 81.2,
      timeSpentSeconds: 432000,
    });
  }
}

export class DefaultPlatformTrendEngine implements PlatformTrendEngine {
  async calculatePlatformTrend(_range: DateRange, _data: any[]): Promise<LearningTrend> {
    const trend = LearningTrend.create('DAU');
    trend.addPoint(new TrendPoint(new Date(), 300));
    trend.addPoint(new TrendPoint(new Date(), 320));
    return trend;
  }
}

export class DefaultCompetencyAnalyticsEngine implements CompetencyAnalyticsEngine {
  async analyzeCompetency(competencyCode: string, _data: any[]): Promise<CompetencyAnalytics> {
    return CompetencyAnalytics.create(competencyCode, 'Mock Competency', 76.5);
  }
}

export class DefaultInstructorInsightEngine implements InstructorInsightEngine {
  async generateInsights(_cohortId: string, _data: any[]): Promise<Record<string, any>> {
    return {
      recommendations: ['Assign practice tasks on grammar', 'Follow up with 2 high-risk students'],
    };
  }
}

export class DefaultPlatformMetricsEngine implements PlatformMetricsEngine {
  async calculateKPIs(_date: Date, _data: any[]): Promise<Record<string, any>> {
    return {
      dau: 320,
      mau: 1450,
      predictionAccuracyRate: 87.5,
    };
  }
}

export class DefaultExportEngine implements ExportEngine {
  async generateExport(_job: ExportJob, _data: any[]): Promise<ReportResult> {
    return new ReportResult('https://downloads.clasptek.com/reports/analytics_export.csv', 102400);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SPRINT 2.11.1 ENTERPRISE LEARNING ANALYTICS ADDITIONS
// ═══════════════════════════════════════════════════════════════════════

export type RefreshPolicyType = 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type AggregationStrategyType =
  'SUM' | 'AVERAGE' | 'COUNT' | 'PERCENTILE' | 'WEIGHTED_AVERAGE';
export type ExportJobStatus =
  'REQUESTED' | 'VALIDATING' | 'ANONYMIZING' | 'AGGREGATING' | 'READY' | 'EXPIRED' | 'FAILED';

export class MetricCode {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('MetricCode cannot be empty');
    }
  }
}

export class MetricFormula {
  constructor(
    public readonly expression: string,
    public readonly sourceDomains: string[],
    public readonly aggregationStrategy: AggregationStrategyType
  ) {}
}

export class MetricOwner {
  constructor(
    public readonly team: string,
    public readonly email: string
  ) {}
}

export class RefreshPolicy {
  constructor(
    public readonly policyType: RefreshPolicyType,
    public readonly cronSchedule?: string
  ) {}
}

export class MetricVersion {
  constructor(
    public readonly version: string,
    public readonly effectiveFrom: Date,
    public readonly retiredAt?: Date
  ) {}
}

export class CalculationRule {
  constructor(
    public readonly ruleId: string,
    public readonly formula: MetricFormula,
    public readonly parameters: Record<string, any> = {}
  ) {}
}

export class MetricDefinition extends Entity<string> {
  public code: MetricCode;
  public name: string;
  public businessDefinition: string;
  public owner: MetricOwner;
  public refreshPolicy: RefreshPolicy;
  public currentVersion: MetricVersion;
  public calculationRule: CalculationRule;
  public status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';

  constructor(props: {
    id: string;
    code: MetricCode;
    name: string;
    businessDefinition: string;
    owner: MetricOwner;
    refreshPolicy: RefreshPolicy;
    currentVersion: MetricVersion;
    calculationRule: CalculationRule;
    status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  }) {
    super(props.id);
    this.code = props.code;
    this.name = props.name;
    this.businessDefinition = props.businessDefinition;
    this.owner = props.owner;
    this.refreshPolicy = props.refreshPolicy;
    this.currentVersion = props.currentVersion;
    this.calculationRule = props.calculationRule;
    this.status = props.status;
  }
}

export class MetricCatalog extends Entity<string> {
  private _metrics: Map<string, MetricDefinition> = new Map();

  constructor(id: string, metrics: MetricDefinition[] = []) {
    super(id);
    metrics.forEach((m) => this._metrics.set(m.code.value, m));
  }

  public registerMetric(metric: MetricDefinition): void {
    this._metrics.set(metric.code.value, metric);
  }

  public getMetric(code: string): MetricDefinition | undefined {
    return this._metrics.get(code);
  }

  public listMetrics(): MetricDefinition[] {
    return Array.from(this._metrics.values());
  }
}

export class AnalyticsMetadata {
  constructor(
    public readonly sourceDomains: string[],
    public readonly calculationVersion: string,
    public readonly refreshTimestamp: Date,
    public readonly dataQualityStatus: 'VALID' | 'DEGRADED' | 'INVALID',
    public readonly owner: string,
    public readonly pipelineVersion: string = 'v2.1.1'
  ) {}
}

export class DataLineage {
  constructor(
    public readonly targetEntityId: string,
    public readonly upstreamSources: Array<{ domain: string; entityId: string; fetchedAt: Date }>,
    public readonly transformationPipeline: string
  ) {}
}

export class AnalyticsSnapshot extends Entity<string> {
  public generatedAt: Date;
  public warehouseVersion: string;
  public metricVersions: Record<string, string>;
  public benchmarkVersion: string;
  public predictionVersion: string;

  constructor(props: {
    id: string;
    generatedAt: Date;
    warehouseVersion: string;
    metricVersions: Record<string, string>;
    benchmarkVersion: string;
    predictionVersion: string;
  }) {
    super(props.id);
    this.generatedAt = props.generatedAt;
    this.warehouseVersion = props.warehouseVersion;
    this.metricVersions = props.metricVersions;
    this.benchmarkVersion = props.benchmarkVersion;
    this.predictionVersion = props.predictionVersion;
  }
}

export class ConfidenceScore {
  constructor(
    public readonly score: number, // 0.0 to 1.0
    public readonly sampleSize: number,
    public readonly marginOfError: number
  ) {
    if (score < 0 || score > 1) {
      throw new Error('Confidence score must be between 0.0 and 1.0');
    }
  }
}

export class EvidenceSummary {
  constructor(
    public readonly supportingKpis: Array<{ code: string; value: number; trend: string }>,
    public readonly timePeriod: DateRange,
    public readonly comparisonBaseline: string,
    public readonly rationale: string
  ) {}
}

export class ExecutiveFinding extends Entity<string> {
  public topic: string;
  public findingStatement: string;
  public evidence: EvidenceSummary;
  public confidence: ConfidenceScore;
  public snapshotId: string;

  constructor(props: {
    id: string;
    topic: string;
    findingStatement: string;
    evidence: EvidenceSummary;
    confidence: ConfidenceScore;
    snapshotId: string;
  }) {
    super(props.id);
    this.topic = props.topic;
    this.findingStatement = props.findingStatement;
    this.evidence = props.evidence;
    this.confidence = props.confidence;
    this.snapshotId = props.snapshotId;
  }
}

export class ExecutiveInsight extends Entity<string> {
  public category: string;
  public title: string;
  public presentationNarrative: string;
  public primaryFindingId: string;
  public supportingFindingIds: string[];
  public recommendedActions: string[];
  public publishedAt: Date;

  constructor(props: {
    id: string;
    category: string;
    title: string;
    presentationNarrative: string;
    primaryFindingId: string;
    supportingFindingIds: string[];
    recommendedActions: string[];
    publishedAt: Date;
  }) {
    super(props.id);
    this.category = props.category;
    this.title = props.title;
    this.presentationNarrative = props.presentationNarrative;
    this.primaryFindingId = props.primaryFindingId;
    this.supportingFindingIds = props.supportingFindingIds;
    this.recommendedActions = props.recommendedActions;
    this.publishedAt = props.publishedAt;
  }
}

export class ResearchExportJob extends Entity<string> {
  public requestedBy: string;
  public datasetType: 'STUDENT_PROGRESS' | 'READINESS' | 'INTERVENTIONS' | 'PROGRAMME_PERFORMANCE';
  public status: ExportJobStatus;
  public isAnonymized: boolean;
  public recordCount: number;
  public fileUrl?: string | undefined;
  public requestedAt: Date;
  public completedAt?: Date | undefined;
  public failureReason?: string | undefined;

  constructor(props: {
    id: string;
    requestedBy: string;
    datasetType: 'STUDENT_PROGRESS' | 'READINESS' | 'INTERVENTIONS' | 'PROGRAMME_PERFORMANCE';
    status: ExportJobStatus;
    isAnonymized: boolean;
    recordCount: number;
    fileUrl?: string;
    requestedAt: Date;
    completedAt?: Date;
    failureReason?: string;
  }) {
    super(props.id);
    this.requestedBy = props.requestedBy;
    this.datasetType = props.datasetType;
    this.status = props.status;
    this.isAnonymized = props.isAnonymized;
    this.recordCount = props.recordCount;
    this.fileUrl = props.fileUrl;
    this.requestedAt = props.requestedAt;
    this.completedAt = props.completedAt;
    this.failureReason = props.failureReason;
  }

  public updateStatus(
    status: ExportJobStatus,
    fileUrl?: string,
    recordCount?: number,
    failureReason?: string
  ): void {
    this.status = status;
    if (fileUrl !== undefined) this.fileUrl = fileUrl;
    if (recordCount !== undefined) this.recordCount = recordCount;
    if (failureReason !== undefined) this.failureReason = failureReason;
    if (status === 'READY' || status === 'FAILED') {
      this.completedAt = new Date();
    }
  }
}

export class DataQualityAlert extends Entity<string> {
  public issueType: string;
  public severity: 'INFO' | 'WARNING' | 'CRITICAL';
  public sourceComponent: string;
  public details: string;
  public status: 'ACTIVE' | 'RESOLVED';
  public detectedAt: Date;

  constructor(props: {
    id: string;
    issueType: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    sourceComponent: string;
    details: string;
    status: 'ACTIVE' | 'RESOLVED';
    detectedAt: Date;
  }) {
    super(props.id);
    this.issueType = props.issueType;
    this.severity = props.severity;
    this.sourceComponent = props.sourceComponent;
    this.details = props.details;
    this.status = props.status;
    this.detectedAt = props.detectedAt;
  }
}

export class InstitutionalBenchmark extends Entity<string> {
  public category: string;
  public metricCode: string;
  public institutionalAverage: number;
  public topDecileScore: number;
  public cohortPercentiles: Array<{ cohortId: string; percentile: number; score: number }>;
  public computedAt: Date;

  constructor(props: {
    id: string;
    category: string;
    metricCode: string;
    institutionalAverage: number;
    topDecileScore: number;
    cohortPercentiles: Array<{ cohortId: string; percentile: number; score: number }>;
    computedAt: Date;
  }) {
    super(props.id);
    this.category = props.category;
    this.metricCode = props.metricCode;
    this.institutionalAverage = props.institutionalAverage;
    this.topDecileScore = props.topDecileScore;
    this.cohortPercentiles = props.cohortPercentiles;
    this.computedAt = props.computedAt;
  }
}

export class PredictionForecast extends Entity<string> {
  public studentId: string;
  public targetMetric: string;
  public predictedValue: number;
  public confidence: ConfidenceScore;
  public forecastHorizonDays: number;
  public modelVersion: string;
  public generatedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    targetMetric: string;
    predictedValue: number;
    confidence: ConfidenceScore;
    forecastHorizonDays: number;
    modelVersion: string;
    generatedAt: Date;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.targetMetric = props.targetMetric;
    this.predictedValue = props.predictedValue;
    this.confidence = props.confidence;
    this.forecastHorizonDays = props.forecastHorizonDays;
    this.modelVersion = props.modelVersion;
    this.generatedAt = props.generatedAt;
  }
}
