import { Entity, AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. DOMAIN EVENTS
// ═══════════════════════════════════════════════════════════════════

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BasePredictionEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {},
    occurredAt: Date = new Date()
  ) {
    this.occurredAt = occurredAt;
  }
}

export class PredictionGenerated extends BasePredictionEvent {
  constructor(predictionId: string, studentId: string, overallScore: number, occurredAt?: Date) {
    super('PredictionGenerated', predictionId, { studentId, overallScore }, occurredAt);
  }
}

export class PredictionPublished extends BasePredictionEvent {
  constructor(predictionId: string, studentId: string, overallScore: number, occurredAt?: Date) {
    super('PredictionPublished', predictionId, { studentId, overallScore }, occurredAt);
  }
}

export class InterventionTriggered extends BasePredictionEvent {
  constructor(interventionId: string, studentId: string, riskLevel: string, occurredAt?: Date) {
    super('InterventionTriggered', interventionId, { studentId, riskLevel }, occurredAt);
  }
}

export class ExperimentCreated extends BasePredictionEvent {
  constructor(experimentId: string, experimentCode: string, occurredAt?: Date) {
    super('ExperimentCreated', experimentId, { experimentCode }, occurredAt);
  }
}

export class QualityMetricsLogged extends BasePredictionEvent {
  constructor(metricsId: string, modelVersionId: string, accuracy: number, occurredAt?: Date) {
    super('QualityMetricsLogged', metricsId, { modelVersionId, accuracy }, occurredAt);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class ReadinessScore extends ValueObject<{ value: number; scale: string }> {
  constructor(value: number, scale: string) {
    if (value < 0) throw new Error('Readiness score cannot be negative');
    super({ value, scale });
  }
  get value(): number { return this.props.value; }
  get scale(): string { return this.props.scale; }
}

export class ConfidenceBand extends ValueObject<{ confidence: number; low: number; high: number }> {
  constructor(confidence: number, low: number, high: number) {
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence value must be between 0.0 and 1.0');
    }
    if (low > high) {
      throw new Error('Confidence lower band cannot be greater than upper band');
    }
    super({ confidence, low, high });
  }
  get confidence(): number { return this.props.confidence; }
  get low(): number { return this.props.low; }
  get high(): number { return this.props.high; }
}

export class PredictionFeature extends ValueObject<{
  featureCode: string;
  displayName: string;
  dataType: 'FLOAT' | 'INTEGER' | 'BOOLEAN' | 'TEXT';
  description?: string;
}> {
  constructor(props: {
    featureCode: string;
    displayName: string;
    dataType: 'FLOAT' | 'INTEGER' | 'BOOLEAN' | 'TEXT';
    description?: string;
  }) {
    if (!props.featureCode) throw new Error('Feature code is required');
    super(props);
  }
  get featureCode(): string { return this.props.featureCode; }
  get displayName(): string { return this.props.displayName; }
  get dataType(): string { return this.props.dataType; }
  get description(): string | undefined { return this.props.description; }
}

export type InterventionPriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';

export class ModelLineage extends ValueObject<{
  supersedesVersionId?: string;
  trainedFromDataset?: string;
  calibrationDatasetRef?: string;
  deploymentDate?: Date;
  retirementDate?: Date;
}> {
  constructor(props: {
    supersedesVersionId?: string;
    trainedFromDataset?: string;
    calibrationDatasetRef?: string;
    deploymentDate?: Date;
    retirementDate?: Date;
  }) {
    super(props);
  }
  get supersedesVersionId(): string | undefined { return this.props.supersedesVersionId; }
  get trainedFromDataset(): string | undefined { return this.props.trainedFromDataset; }
  get calibrationDatasetRef(): string | undefined { return this.props.calibrationDatasetRef; }
  get deploymentDate(): Date | undefined { return this.props.deploymentDate; }
  get retirementDate(): Date | undefined { return this.props.retirementDate; }
}

export class ModelConfiguration extends ValueObject<{
  configuration: Record<string, any>;
  lineage?: ModelLineage;
}> {
  constructor(configuration: Record<string, any>, lineage?: ModelLineage) {
    const props: { configuration: Record<string, any>; lineage?: ModelLineage } = {
      configuration: Object.freeze({ ...configuration })
    };
    if (lineage !== undefined) {
      props.lineage = lineage;
    }
    super(props);
  }
  get configuration(): Record<string, any> { return this.props.configuration; }
  get lineage(): ModelLineage | undefined { return this.props.lineage; }
}

export class ModelVersion extends AggregateRoot<string> {
  public readonly modelId: string;
  public readonly versionString: string;
  public readonly configuration: ModelConfiguration;
  public readonly isCurrent: boolean;
  public readonly lineage: ModelLineage | undefined;
  public readonly trainedAt: Date;

  constructor(props: {
    id: string;
    modelId: string;
    versionString: string;
    configuration: ModelConfiguration;
    isCurrent: boolean;
    lineage?: ModelLineage;
    trainedAt?: Date;
  }) {
    super(props.id);
    this.modelId = props.modelId;
    this.versionString = props.versionString;
    this.configuration = props.configuration;
    this.isCurrent = props.isCurrent;
    this.lineage = props.lineage;
    this.trainedAt = props.trainedAt ?? new Date();
  }
}


// ═══════════════════════════════════════════════════════════════════
// 3. ENTITIES & AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════

export class ReadinessSnapshot extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly learnerState: Record<string, any>;
  public readonly latestEvaluationSummaries: Record<string, any>;
  public readonly practiceStatistics: Record<string, any>;
  public readonly studyStreak: Record<string, any>;
  public readonly competencyMastery: Record<string, any>;
  public readonly forecastWindow: string;
  public readonly modelVersionId: string | undefined;
  public readonly snapshottedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    learnerState: Record<string, any>;
    latestEvaluationSummaries: Record<string, any>;
    practiceStatistics: Record<string, any>;
    studyStreak: Record<string, any>;
    competencyMastery: Record<string, any>;
    forecastWindow: string;
    modelVersionId?: string | undefined;
    snapshottedAt?: Date;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.learnerState = Object.freeze({ ...props.learnerState });
    this.latestEvaluationSummaries = Object.freeze({ ...props.latestEvaluationSummaries });
    this.practiceStatistics = Object.freeze({ ...props.practiceStatistics });
    this.studyStreak = Object.freeze({ ...props.studyStreak });
    this.competencyMastery = Object.freeze({ ...props.competencyMastery });
    this.forecastWindow = props.forecastWindow;
    this.modelVersionId = props.modelVersionId;
    this.snapshottedAt = props.snapshottedAt ?? new Date();
  }

  public static create(props: {
    studentId: string;
    learnerState: Record<string, any>;
    latestEvaluationSummaries: Record<string, any>;
    practiceStatistics: Record<string, any>;
    studyStreak: Record<string, any>;
    competencyMastery: Record<string, any>;
    forecastWindow: string;
    modelVersionId?: string | undefined;
  }): ReadinessSnapshot {
    return new ReadinessSnapshot({
      id: randomUUID(),
      ...props
    });
  }
}

export class PredictionFeatureSet extends Entity<string> {
  public readonly features: Record<string, number | string | boolean>;

  constructor(props: { id: string; features: Record<string, number | string | boolean> }) {
    super(props.id);
    this.features = Object.freeze({ ...props.features });
  }
}

export class PredictionExplanation extends Entity<string> {
  public readonly contributingFactors: Array<{ factor: string; weight: number }>;
  public readonly featureImportance: Record<string, number>;
  public readonly confidenceExplanation: string;
  public readonly evidenceReferences: string[];
  public readonly featureContributionRanking: string[];
  public readonly predictionCertainty: number;
  public readonly certaintyScore: number;
  public readonly topInfluencingCompetencies: string[];
  public readonly strongestRiskIndicators: string[];

  constructor(props: {
    id: string;
    contributingFactors: Array<{ factor: string; weight: number }>;
    featureImportance: Record<string, number>;
    confidenceExplanation: string;
    evidenceReferences: string[];
    certaintyScore?: number;
    predictionCertainty?: number;
    featureContributionRanking?: string[];
    topInfluencingCompetencies?: string[];
    strongestRiskIndicators?: string[];
  }) {
    super(props.id);
    this.contributingFactors = [...props.contributingFactors];
    this.featureImportance = Object.freeze({ ...props.featureImportance });
    this.confidenceExplanation = props.confidenceExplanation;
    this.evidenceReferences = [...props.evidenceReferences];
    this.predictionCertainty = props.predictionCertainty ?? props.certaintyScore ?? 1.00;
    this.certaintyScore = this.predictionCertainty;
    this.featureContributionRanking = props.featureContributionRanking ?? Object.keys(this.featureImportance);
    this.topInfluencingCompetencies = props.topInfluencingCompetencies ?? [];
    this.strongestRiskIndicators = props.strongestRiskIndicators ?? [];
  }
}

export class PredictionEvidence extends Entity<string> {
  public readonly evidenceType: string;
  public readonly evidenceSourceId: string;
  public readonly weight: number;
  public readonly description: string;

  constructor(props: {
    id: string;
    evidenceType: string;
    evidenceSourceId: string;
    weight: number;
    description: string;
  }) {
    super(props.id);
    this.evidenceType = props.evidenceType;
    this.evidenceSourceId = props.evidenceSourceId;
    this.weight = props.weight;
    this.description = props.description;
  }
}

export class PredictionTrend extends Entity<string> {
  public readonly trendType: string;
  public readonly slope: number;
  public readonly explanation: string;

  constructor(props: { id: string; trendType: string; slope: number; explanation: string }) {
    super(props.id);
    this.trendType = props.trendType;
    this.slope = props.slope;
    this.explanation = props.explanation;
  }
}

export class PredictionRecommendation extends Entity<string> {
  public readonly recommendationType: string;
  public readonly priority: number;
  public readonly title: string;
  public readonly description: string | undefined;
  public readonly targetResourceId: string | undefined;
  public readonly targetCompetencyCode: string | undefined;
  public readonly catalogueCode: string | undefined;

  constructor(props: {
    id: string;
    recommendationType: string;
    priority: number;
    title: string;
    description?: string | undefined;
    targetResourceId?: string | undefined;
    targetCompetencyCode?: string | undefined;
    catalogueCode?: string | undefined;
  }) {
    super(props.id);
    this.recommendationType = props.recommendationType;
    this.priority = props.priority;
    this.title = props.title;
    this.description = props.description;
    this.targetResourceId = props.targetResourceId;
    this.targetCompetencyCode = props.targetCompetencyCode;
    this.catalogueCode = props.catalogueCode;
  }
}

export class PredictionIntervention extends Entity<string> {
  public readonly studentId: string;
  public readonly riskLevel: InterventionPriorityLevel;
  public readonly riskScore: number;
  public readonly triggerReason: string;
  private _status: 'PROPOSED' | 'ACTIVE' | 'COMPLETED' | 'DISCARDED';
  public readonly recommendations: PredictionRecommendation[];

  constructor(props: {
    id: string;
    studentId: string;
    riskLevel: InterventionPriorityLevel;
    riskScore: number;
    triggerReason: string;
    status: 'PROPOSED' | 'ACTIVE' | 'COMPLETED' | 'DISCARDED';
    recommendations: PredictionRecommendation[];
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.riskLevel = props.riskLevel;
    this.riskScore = props.riskScore;
    this.triggerReason = props.triggerReason;
    this._status = props.status;
    this.recommendations = [...props.recommendations];
  }

  get status(): string { return this._status; }

  public activate(): void {
    this._status = 'ACTIVE';
  }

  public complete(): void {
    this._status = 'COMPLETED';
  }

  public discard(): void {
    this._status = 'DISCARDED';
  }
}

export class ReadinessPrediction extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly profileId: string;
  public readonly modelVersionId: string;
  private _status: 'DRAFT' | 'PUBLISHED';
  private _overallReadinessScore: ReadinessScore | undefined;
  private _confidence: ConfidenceBand | undefined;
  private _featureSet: PredictionFeatureSet | undefined;
  private _explanation: PredictionExplanation | undefined;
  public readonly evidence: PredictionEvidence[] = [];
  public readonly trends: PredictionTrend[] = [];
  public readonly interventions: PredictionIntervention[] = [];
  public readonly lockVersion: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  private _publishedAt: Date | undefined;

  constructor(props: {
    id: string;
    studentId: string;
    profileId: string;
    modelVersionId: string;
    status: 'DRAFT' | 'PUBLISHED';
    overallReadinessScore?: ReadinessScore | undefined;
    confidence?: ConfidenceBand | undefined;
    featureSet?: PredictionFeatureSet | undefined;
    explanation?: PredictionExplanation | undefined;
    evidence?: PredictionEvidence[];
    trends?: PredictionTrend[];
    interventions?: PredictionIntervention[];
    lockVersion?: number;
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.profileId = props.profileId;
    this.modelVersionId = props.modelVersionId;
    this._status = props.status;
    this._overallReadinessScore = props.overallReadinessScore;
    this._confidence = props.confidence;
    this._featureSet = props.featureSet;
    this._explanation = props.explanation;
    if (props.evidence) this.evidence = [...props.evidence];
    if (props.trends) this.trends = [...props.trends];
    if (props.interventions) this.interventions = [...props.interventions];
    this.lockVersion = props.lockVersion ?? 1;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this._publishedAt = props.publishedAt;
  }

  get status(): 'DRAFT' | 'PUBLISHED' { return this._status; }
  get overallReadinessScore(): ReadinessScore | undefined { return this._overallReadinessScore; }
  get confidence(): ConfidenceBand | undefined { return this._confidence; }
  get featureSet(): PredictionFeatureSet | undefined { return this._featureSet; }
  get explanation(): PredictionExplanation | undefined { return this._explanation; }
  get publishedAt(): Date | undefined { return this._publishedAt; }

  public static generate(props: {
    studentId: string;
    profileId: string;
    modelVersionId: string;
  }): ReadinessPrediction {
    return new ReadinessPrediction({
      id: randomUUID(),
      studentId: props.studentId,
      profileId: props.profileId,
      modelVersionId: props.modelVersionId,
      status: 'DRAFT'
    });
  }

  public completePrediction(
    overallScore: ReadinessScore,
    confidence: ConfidenceBand,
    featureSet: PredictionFeatureSet,
    explanation: PredictionExplanation,
    evidence: PredictionEvidence[],
    trends: PredictionTrend[],
    interventions: PredictionIntervention[]
  ): void {
    this._overallReadinessScore = overallScore;
    this._confidence = confidence;
    this._featureSet = featureSet;
    this._explanation = explanation;
    this.evidence.push(...evidence);
    this.trends.push(...trends);
    this.interventions.push(...interventions);

    this.addDomainEvent(new PredictionGenerated(this.id, this.studentId, overallScore.value));

    // Handle automatically triggering events for critical/high interventions
    for (const intervention of interventions) {
      if (intervention.riskLevel === 'CRITICAL' || intervention.riskLevel === 'HIGH') {
        this.addDomainEvent(new InterventionTriggered(intervention.id, this.studentId, intervention.riskLevel));
      }
    }
  }

  public publish(at: Date = new Date()): void {
    if (this._status === 'PUBLISHED') return;
    this._status = 'PUBLISHED';
    this._publishedAt = at;
    if (this._overallReadinessScore) {
      this.addDomainEvent(new PredictionPublished(this.id, this.studentId, this._overallReadinessScore.value, at));
    }
  }
}

export class PredictionExperiment extends AggregateRoot<string> {
  public readonly experimentCode: string;
  public readonly displayName: string;
  public readonly controlModelVersionId: string;
  public readonly challengerModelVersionId: string;
  public readonly trafficSplitPercentage: number;
  private _status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'ARCHIVED';
  private _startDate: Date | undefined;
  private _endDate: Date | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    experimentCode: string;
    displayName: string;
    controlModelVersionId: string;
    challengerModelVersionId: string;
    trafficSplitPercentage: number;
    status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'ARCHIVED';
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    createdAt?: Date;
  }) {
    super(props.id);
    this.experimentCode = props.experimentCode;
    this.displayName = props.displayName;
    this.controlModelVersionId = props.controlModelVersionId;
    this.challengerModelVersionId = props.challengerModelVersionId;
    this.trafficSplitPercentage = props.trafficSplitPercentage;
    this._status = props.status;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this.createdAt = props.createdAt ?? new Date();
  }

  get status(): 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'ARCHIVED' { return this._status; }
  get startDate(): Date | undefined { return this._startDate; }
  get endDate(): Date | undefined { return this._endDate; }

  public static create(props: {
    experimentCode: string;
    displayName: string;
    controlModelVersionId: string;
    challengerModelVersionId: string;
    trafficSplitPercentage: number;
  }): PredictionExperiment {
    const id = randomUUID();
    const exp = new PredictionExperiment({ id, ...props, status: 'DRAFT' });
    exp.addDomainEvent(new ExperimentCreated(id, props.experimentCode));
    return exp;
  }

  public start(at: Date = new Date()): void {
    if (this._status !== 'DRAFT') {
      throw new Error(`Cannot start experiment in status '${this._status}'`);
    }
    this._status = 'RUNNING';
    this._startDate = at;
  }

  public complete(at: Date = new Date()): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot complete experiment in status '${this._status}'`);
    }
    this._status = 'COMPLETED';
    this._endDate = at;
  }

  public archive(): void {
    this._status = 'ARCHIVED';
  }
}

export class PredictionCalibration extends Entity<string> {
  public readonly modelVersionId: string;
  public readonly expectedScore: number;
  public readonly observedScore: number;
  public readonly calibrationError: number;
  public readonly measuredAt: Date;

  constructor(props: {
    id: string;
    modelVersionId: string;
    expectedScore: number;
    observedScore: number;
    calibrationError: number;
    measuredAt: Date;
  }) {
    super(props.id);
    this.modelVersionId = props.modelVersionId;
    this.expectedScore = props.expectedScore;
    this.observedScore = props.observedScore;
    this.calibrationError = props.calibrationError;
    this.measuredAt = props.measuredAt;
  }
}

export class PredictionQualityMetrics extends Entity<string> {
  public readonly modelVersionId: string;
  public readonly measuredAt: Date;
  public readonly predictionAccuracy: number;
  public readonly calibrationError: number;
  public readonly interventionSuccessRate: number;
  public readonly falsePositiveRate: number;
  public readonly falseNegativeRate: number;
  public readonly forecastDrift: number;
  public readonly modelStability: number;
  public readonly operationalLatencyMs: number | undefined;
  public readonly completionRate: number | undefined;

  constructor(props: {
    id: string;
    modelVersionId: string;
    measuredAt: Date;
    predictionAccuracy: number;
    calibrationError: number;
    interventionSuccessRate: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    forecastDrift: number;
    modelStability: number;
    operationalLatencyMs?: number;
    completionRate?: number;
  }) {
    super(props.id);
    this.modelVersionId = props.modelVersionId;
    this.measuredAt = props.measuredAt;
    this.predictionAccuracy = props.predictionAccuracy;
    this.calibrationError = props.calibrationError;
    this.interventionSuccessRate = props.interventionSuccessRate;
    this.falsePositiveRate = props.falsePositiveRate;
    this.falseNegativeRate = props.falseNegativeRate;
    this.forecastDrift = props.forecastDrift;
    this.modelStability = props.modelStability;
    this.operationalLatencyMs = props.operationalLatencyMs;
    this.completionRate = props.completionRate;
  }
}

export class PredictionHistory extends Entity<string> {
  public readonly studentId: string;
  public readonly predictionId: string;
  public readonly overallReadinessScore: number;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    predictionId: string;
    overallReadinessScore: number;
    recordedAt: Date;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.predictionId = props.predictionId;
    this.overallReadinessScore = props.overallReadinessScore;
    this.recordedAt = props.recordedAt;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. PREDICTION ENGINE STRATEGIES
// ═══════════════════════════════════════════════════════════════════

export interface PredictionResult {
  overallScore: number;
  confidence: ConfidenceBand;
  features: Record<string, number | string | boolean>;
  explanation: {
    contributingFactors: Array<{ factor: string; weight: number }>;
    featureImportance: Record<string, number>;
    confidenceExplanation: string;
    evidenceReferences: string[];
    featureContributionRanking: string[];
    predictionCertainty: number;
    topInfluencingCompetencies: string[];
    strongestRiskIndicators: string[];
  };
  evidence: Array<{
    type: string;
    sourceId: string;
    weight: number;
    description: string;
  }>;
  trends: Array<{
    type: string;
    slope: number;
    explanation: string;
  }>;
  interventions: Array<{
    riskLevel: InterventionPriorityLevel;
    riskScore: number;
    triggerReason: string;
    recommendations: Array<{
      type: string;
      priority: number;
      title: string;
      description?: string;
      targetResourceId?: string;
      targetCompetencyCode?: string;
      catalogueCode?: string;
    }>;
  }>;
}

export interface PredictionEngine {
  predict(snapshot: ReadinessSnapshot, config: ModelConfiguration): Promise<PredictionResult>;
}

// Concrete Predictor 1 — Mock Predictor (for CI, integration tests, dynamic verification)
export class MockPredictor implements PredictionEngine {
  public async predict(snapshot: ReadinessSnapshot, config: ModelConfiguration): Promise<PredictionResult> {
    const configScore = config.configuration.mock_score ?? 75.0;
    const configConf = config.configuration.mock_confidence ?? 0.90;

    return {
      overallScore: configScore,
      confidence: new ConfidenceBand(configConf, configScore - 5, configScore + 5),
      features: {
        ACCURACY_RATE: 0.78,
        STUDY_VELOCITY: 4.5,
        STUDY_MOMENTUM: 12.0,
        STREAK_COUNT: 5,
        COMPETENCY_MASTERY: 0.65
      },
      explanation: {
        contributingFactors: [
          { factor: 'Recent Practice Accuracy', weight: 0.50 },
          { factor: 'Competency Mastery Level', weight: 0.30 },
          { factor: 'Study Momentum', weight: 0.20 }
        ],
        featureImportance: {
          ACCURACY_RATE: 0.50,
          COMPETENCY_MASTERY: 0.30,
          STUDY_MOMENTUM: 0.20
        },
        confidenceExplanation: 'High confidence due to consistent accuracy rate and study streak.',
        evidenceReferences: [snapshot.id],
        featureContributionRanking: ['ACCURACY_RATE', 'COMPETENCY_MASTERY', 'STUDY_MOMENTUM'],
        predictionCertainty: configConf,
        topInfluencingCompetencies: ['IELTS-LIS-C1'],
        strongestRiskIndicators: ['Low practice consistency']
      },
      evidence: [
        { type: 'COMPLETED_PRACTICE', sourceId: randomUUID(), weight: 0.60, description: 'Completed 12 practice tasks' },
        { type: 'DIAGNOSTIC_EXAM', sourceId: randomUUID(), weight: 0.40, description: 'Diagnostic score of 72%' }
      ],
      trends: [
        { type: 'ACCURACY', slope: 0.05, explanation: 'Accuracy trend is positive, increasing 5% week-over-week.' }
      ],
      interventions: [
        {
          riskLevel: 'LOW',
          riskScore: 15.0,
          triggerReason: 'Consistent study streak is active.',
          recommendations: [
            { type: 'COMPETENCY_DRILL', priority: 1, title: 'Review Grammar Fundamentals', description: 'Focus on complex grammar patterns, syntax rules, and transitions', catalogueCode: 'REVIEW_GRAMMAR_FUNDAMENTALS' }
          ]
        }
      ]
    };
  }
}

// Concrete Predictor 2 — Bayesian Knowledge Tracing Predictor
export class BayesianPredictor implements PredictionEngine {
  public async predict(snapshot: ReadinessSnapshot, config: ModelConfiguration): Promise<PredictionResult> {
    // Basic BKT variables loaded from config
    const pInit = config.configuration.p_init ?? 0.5;
    const pTransit = config.configuration.p_transit ?? 0.1;
    const pSlip = config.configuration.p_slip ?? 0.1;
    const pGuess = config.configuration.p_guess ?? 0.2;

    // Simulate competency calculation from mastery ratios
    const masteryPercentage = Object.keys(snapshot.competencyMastery).length > 0
      ? (Object.values(snapshot.competencyMastery).filter(v => v === true || v === 'MASTERED').length / Object.keys(snapshot.competencyMastery).length)
      : pInit;

    // Bayesian update estimation
    const pKnown = masteryPercentage + (1 - masteryPercentage) * pTransit;
    const estimatedReadiness = (pKnown * (1 - pSlip)) + ((1 - pKnown) * pGuess);
    const scoreVal = parseFloat((estimatedReadiness * 100).toFixed(2));

    return {
      overallScore: scoreVal,
      confidence: new ConfidenceBand(0.85, scoreVal - 8, scoreVal + 8),
      features: {
        ACCURACY_RATE: 0.70,
        COMPETENCY_MASTERY: masteryPercentage
      },
      explanation: {
        contributingFactors: [
          { factor: 'Competency Mastery Ratio', weight: 0.70 },
          { factor: 'Bayesian Transition Probability', weight: 0.30 }
        ],
        featureImportance: {
          COMPETENCY_MASTERY: 0.70,
          BAYESIAN_PARAMS: 0.30
        },
        confidenceExplanation: 'Strong predictability derived from formal BKT mastery state probabilities.',
        evidenceReferences: [snapshot.id],
        featureContributionRanking: ['COMPETENCY_MASTERY', 'BAYESIAN_PARAMS'],
        predictionCertainty: 0.85,
        topInfluencingCompetencies: Object.keys(snapshot.competencyMastery).slice(0, 2),
        strongestRiskIndicators: scoreVal < 60 ? ['Low predicted readiness score'] : []
      },
      evidence: [
        { type: 'MASTERY_TRACKER', sourceId: randomUUID(), weight: 0.80, description: 'Formal curriculum competency assessment' }
      ],
      trends: [
        { type: 'VELOCITY', slope: 0.02, explanation: 'Competency acquisition velocity is steady.' }
      ],
      interventions: scoreVal < 60 ? [
        {
          riskLevel: 'HIGH',
          riskScore: 75.0,
          triggerReason: 'Readiness score drops below critical passing criteria.',
          recommendations: [
            { type: 'REMEDIAL_LESSON', priority: 1, title: 'Review Grammar Fundamentals', description: 'Focus on complex grammar patterns, syntax rules, and transitions', catalogueCode: 'REVIEW_GRAMMAR_FUNDAMENTALS' }
          ]
        }
      ] : []
    };
  }
}

// Concrete Predictor 3 — Linear & Logistic Regression Predictor
export class RegressionPredictor implements PredictionEngine {
  public async predict(snapshot: ReadinessSnapshot, config: ModelConfiguration): Promise<PredictionResult> {
    const weights = config.configuration.weights ?? { velocity: 0.3, accuracy: 0.5, momentum: 0.2 };

    const accuracy = snapshot.practiceStatistics.accuracy ?? 0.70;
    const velocity = snapshot.practiceStatistics.velocity ?? 3.0;
    const momentum = snapshot.practiceStatistics.momentum ?? 5.0;

    // Normalizing values
    const normVelocity = Math.min(velocity / 10, 1.0);
    const normMomentum = Math.min(momentum / 20, 1.0);

    const calculatedReadiness = (accuracy * weights.accuracy) + (normVelocity * weights.velocity) + (normMomentum * weights.momentum);
    const scoreVal = parseFloat((calculatedReadiness * 100).toFixed(2));

    return {
      overallScore: scoreVal,
      confidence: new ConfidenceBand(0.78, scoreVal - 10, scoreVal + 10),
      features: {
        ACCURACY_RATE: accuracy,
        STUDY_VELOCITY: velocity,
        STUDY_MOMENTUM: momentum
      },
      explanation: {
        contributingFactors: [
          { factor: 'Practice Accuracy Metric', weight: weights.accuracy },
          { factor: 'Learning Velocity Metric', weight: weights.velocity },
          { factor: 'Activity Momentum Metric', weight: weights.momentum }
        ],
        featureImportance: {
          ACCURACY_RATE: weights.accuracy,
          STUDY_VELOCITY: weights.velocity,
          STUDY_MOMENTUM: weights.momentum
        },
        confidenceExplanation: 'Multi-factor weighted regression reflecting activity frequency and answer accuracy.',
        evidenceReferences: [snapshot.id],
        featureContributionRanking: ['ACCURACY_RATE', 'STUDY_VELOCITY', 'STUDY_MOMENTUM'],
        predictionCertainty: 0.78,
        topInfluencingCompetencies: [],
        strongestRiskIndicators: []
      },
      evidence: [
        { type: 'STUDY_METRICS_LOG', sourceId: randomUUID(), weight: 0.90, description: 'Weighted aggregation of study history logs' }
      ],
      trends: [
        { type: 'MOMENTUM', slope: -0.01, explanation: 'Momentum is slightly decaying.' }
      ],
      interventions: []
    };
  }
}

// Concrete Predictor 4 — Weighted Rubric Predictor (resembling IELTS band mappings)
export class WeightedRubricPredictor implements PredictionEngine {
  public async predict(snapshot: ReadinessSnapshot, config: ModelConfiguration): Promise<PredictionResult> {
    const weights = config.configuration.weights ?? { writing: 0.4, speaking: 0.3, listening: 0.15, reading: 0.15 };

    const writing = snapshot.learnerState.writing ?? 6.5;
    const speaking = snapshot.learnerState.speaking ?? 7.0;
    const listening = snapshot.learnerState.listening ?? 7.5;
    const reading = snapshot.learnerState.reading ?? 7.0;

    const rawRubricScore = (writing * weights.writing) + (speaking * weights.speaking) + (listening * weights.listening) + (reading * weights.reading);
    const roundedBand = Math.round(rawRubricScore * 2) / 2; // Round to nearest 0.5 like IELTS

    return {
      overallScore: roundedBand,
      confidence: new ConfidenceBand(0.92, roundedBand - 0.5, roundedBand + 0.5),
      features: {
        WRITING_BAND: writing,
        SPEAKING_BAND: speaking,
        LISTENING_BAND: listening,
        READING_BAND: reading
      },
      explanation: {
        contributingFactors: [
          { factor: 'Writing Module Band', weight: weights.writing },
          { factor: 'Speaking Module Band', weight: weights.speaking },
          { factor: 'Listening Module Band', weight: weights.listening },
          { factor: 'Reading Module Band', weight: weights.reading }
        ],
        featureImportance: {
          WRITING_BAND: weights.writing,
          SPEAKING_BAND: weights.speaking,
          LISTENING_BAND: weights.listening,
          READING_BAND: weights.reading
        },
        confidenceExplanation: 'High calibration accuracy mapping composite sub-scores against actual exam rubric weights.',
        evidenceReferences: [snapshot.id],
        featureContributionRanking: ['WRITING_BAND', 'SPEAKING_BAND', 'LISTENING_BAND', 'READING_BAND'],
        predictionCertainty: 0.92,
        topInfluencingCompetencies: [],
        strongestRiskIndicators: []
      },
      evidence: [
        { type: 'ACADEMIC_SUB_SCORES', sourceId: randomUUID(), weight: 0.95, description: 'Composite sub-scores from official exam categories' }
      ],
      trends: [
        { type: 'ACADEMIC_VELOCITY', slope: 0.10, explanation: 'Strong academic performance trends.' }
      ],
      interventions: []
    };
  }
}

// Strategy Registry (Recommendation 2 — Strategy Registry)
export class PredictionStrategyRegistry {
  private static _instance: PredictionStrategyRegistry;
  private readonly _engines = new Map<string, PredictionEngine>();

  private constructor() {
    // Register defaults
    this.register('MOCK', new MockPredictor());
    this.register('BAYESIAN', new BayesianPredictor());
    this.register('REGRESSION', new RegressionPredictor());
    this.register('WEIGHTED_RUBRIC', new WeightedRubricPredictor());
  }

  public static get instance(): PredictionStrategyRegistry {
    if (!this._instance) {
      this._instance = new PredictionStrategyRegistry();
    }
    return this._instance;
  }

  public register(algorithmType: string, engine: PredictionEngine): void {
    this._engines.set(algorithmType.toUpperCase(), engine);
  }

  public get(algorithmType: string): PredictionEngine {
    const engine = this._engines.get(algorithmType.toUpperCase());
    if (!engine) {
      throw new Error(`No prediction engine strategy registered for algorithm type '${algorithmType}'`);
    }
    return engine;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. NEW GOVERNANCE ENTITIES & AGGREGATE ROOTS (Sprint 2.9)
// ═══════════════════════════════════════════════════════════════════

export class PredictionFeatureCatalogueEntry extends Entity<string> {
  public readonly featureCode: string;
  public readonly displayName: string;
  public readonly sourceDomain: string;
  public readonly normalizationMethod: string;
  public readonly defaultWeight: number;
  public readonly version: string;
  public readonly description: string | undefined;

  constructor(props: {
    id: string;
    featureCode: string;
    displayName: string;
    sourceDomain: string;
    normalizationMethod?: string | undefined;
    normalization?: string | undefined;
    defaultWeight?: number | undefined;
    weight?: number | undefined;
    version: string;
    description?: string | undefined;
  }) {
    super(props.id);
    this.featureCode = props.featureCode;
    this.displayName = props.displayName;
    this.sourceDomain = props.sourceDomain;
    this.normalizationMethod = props.normalizationMethod ?? props.normalization ?? 'None';
    this.defaultWeight = props.defaultWeight ?? props.weight ?? 1.0;
    this.version = props.version;
    this.description = props.description;
  }

  // Compatibility getters
  get normalization(): string { return this.normalizationMethod; }
  get weight(): number { return this.defaultWeight; }

  public static create(props: {
    featureCode: string;
    displayName: string;
    sourceDomain: string;
    normalizationMethod?: string | undefined;
    normalization?: string | undefined;
    defaultWeight?: number | undefined;
    weight?: number | undefined;
    version: string;
    description?: string | undefined;
  }): PredictionFeatureCatalogueEntry {
    return new PredictionFeatureCatalogueEntry({
      id: randomUUID(),
      ...props
    });
  }
}

export class PredictionFeatureCatalogue {
  private static _instance: PredictionFeatureCatalogue;
  private readonly _entries = new Map<string, PredictionFeatureCatalogueEntry>();

  private constructor() {
    this.register(new PredictionFeatureCatalogueEntry({
      id: 'f0000000-0000-0000-0000-000000000001',
      featureCode: 'ACCURACY_RATE',
      displayName: 'Average Evaluation Accuracy Rate',
      sourceDomain: 'EVALUATION',
      normalization: 'NONE',
      weight: 0.50,
      version: 'v1.0.0',
      description: 'Overall accuracy percentage across evaluated subjective/objective questions'
    }));
    this.register(new PredictionFeatureCatalogueEntry({
      id: 'f0000000-0000-0000-0000-000000000002',
      featureCode: 'STUDY_VELOCITY',
      displayName: 'Learning Velocity',
      sourceDomain: 'CURRICULUM',
      normalization: 'NONE',
      weight: 0.30,
      version: 'v1.0.0',
      description: 'Average competency items covered per week'
    }));
    this.register(new PredictionFeatureCatalogueEntry({
      id: 'f0000000-0000-0000-0000-000000000003',
      featureCode: 'STUDY_MOMENTUM',
      displayName: 'Recent Study Momentum',
      sourceDomain: 'STREAK',
      normalization: 'NONE',
      weight: 0.20,
      version: 'v1.0.0',
      description: 'Study hours logged in the last 7 days'
    }));
    this.register(new PredictionFeatureCatalogueEntry({
      id: 'f0000000-0000-0000-0000-000000000004',
      featureCode: 'STREAK_COUNT',
      displayName: 'Current Study Streak',
      sourceDomain: 'STREAK',
      normalization: 'NONE',
      weight: 0.10,
      version: 'v1.0.0',
      description: 'Number of consecutive active study days'
    }));
    this.register(new PredictionFeatureCatalogueEntry({
      id: 'f0000000-0000-0000-0000-000000000005',
      featureCode: 'COMPETENCY_MASTERY',
      displayName: 'Overall Competency Mastery',
      sourceDomain: 'CURRICULUM',
      normalization: 'NONE',
      weight: 0.40,
      version: 'v1.0.0',
      description: 'Ratio of mastered competencies to target curriculum requirements'
    }));
  }

  public static get instance(): PredictionFeatureCatalogue {
    if (!this._instance) {
      this._instance = new PredictionFeatureCatalogue();
    }
    return this._instance;
  }

  public register(entry: PredictionFeatureCatalogueEntry): void {
    this._entries.set(entry.featureCode.toUpperCase(), entry);
  }

  public get(featureCode: string): PredictionFeatureCatalogueEntry {
    const entry = this._entries.get(featureCode.toUpperCase());
    if (!entry) {
      throw new Error(`Feature '${featureCode}' is not registered in the feature catalogue`);
    }
    return entry;
  }

  public getAll(): PredictionFeatureCatalogueEntry[] {
    return Array.from(this._entries.values());
  }
}

export class PredictionModelVersion extends Entity<string> {
  public readonly modelId: string;
  public readonly versionString: string;
  public readonly configuration: Record<string, any>;
  public readonly isCurrent: boolean;
  public readonly trainedAt: Date;
  public readonly supersedesModelVersionId: string | undefined;
  public readonly trainedFrom: string | undefined;
  public readonly calibrationDataset: string | undefined;
  public readonly deploymentDate: Date | undefined;
  public readonly retirementDate: Date | undefined;

  constructor(props: {
    id: string;
    modelId: string;
    versionString: string;
    configuration: Record<string, any>;
    isCurrent: boolean;
    trainedAt: Date;
    supersedesModelVersionId?: string;
    trainedFrom?: string;
    calibrationDataset?: string;
    deploymentDate?: Date;
    retirementDate?: Date;
  }) {
    super(props.id);
    this.modelId = props.modelId;
    this.versionString = props.versionString;
    this.configuration = Object.freeze({ ...props.configuration });
    this.isCurrent = props.isCurrent;
    this.trainedAt = props.trainedAt;
    this.supersedesModelVersionId = props.supersedesModelVersionId;
    this.trainedFrom = props.trainedFrom;
    this.calibrationDataset = props.calibrationDataset;
    this.deploymentDate = props.deploymentDate;
    this.retirementDate = props.retirementDate;
  }
}

export class PredictionModel extends AggregateRoot<string> {
  public readonly modelCode: string;
  public readonly displayName: string;
  public readonly algorithmType: string;
  public readonly isActive: boolean;
  public readonly versions: PredictionModelVersion[] = [];

  constructor(props: {
    id: string;
    modelCode: string;
    displayName: string;
    algorithmType: string;
    isActive: boolean;
    versions?: PredictionModelVersion[];
  }) {
    super(props.id);
    this.modelCode = props.modelCode;
    this.displayName = props.displayName;
    this.algorithmType = props.algorithmType;
    this.isActive = props.isActive;
    if (props.versions) this.versions = [...props.versions];
  }
}

export class PredictionInterventionCatalogueEntry extends Entity<string> {
  public readonly interventionType: string;
  public readonly title: string;
  public readonly description: string;
  public readonly priority: number;
  public readonly targetResourceId: string | undefined;
  public readonly targetCompetencyCode: string | undefined;

  constructor(props: {
    id: string;
    interventionType: string;
    title: string;
    description: string;
    priority: number;
    targetResourceId?: string;
    targetCompetencyCode?: string;
  }) {
    super(props.id);
    this.interventionType = props.interventionType;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this.targetResourceId = props.targetResourceId;
    this.targetCompetencyCode = props.targetCompetencyCode;
  }

  // Compatibility getters
  get catalogueCode(): string { return this.interventionType; }
  get recommendationType(): string { return this.interventionType; }
  get isActive(): boolean { return true; }

  public static create(props: {
    interventionType: string;
    title: string;
    description: string;
    priority: number;
    targetResourceId?: string;
    targetCompetencyCode?: string;
  }): PredictionInterventionCatalogueEntry {
    return new PredictionInterventionCatalogueEntry({
      id: randomUUID(),
      ...props
    });
  }
}

// Keep alias for compatibility
export class InterventionCatalogueEntry extends PredictionInterventionCatalogueEntry {}

export class PredictionOutcome extends AggregateRoot<string> {
  public readonly predictionId: string;
  public readonly studentId: string;
  public readonly predictedScore: number;
  public readonly actualScore: number;
  public readonly variance: number;
  public readonly calibrationDelta: number;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    predictionId: string;
    studentId: string;
    predictedScore?: number;
    actualScore?: number;
    predictedReadiness?: number;
    actualExamResult?: number;
    variance?: number;
    calibrationDelta?: number;
    recordedAt?: Date;
  }) {
    super(props.id);
    this.predictionId = props.predictionId;
    this.studentId = props.studentId;
    this.predictedScore = props.predictedScore ?? props.predictedReadiness ?? 0;
    this.actualScore = props.actualScore ?? props.actualExamResult ?? 0;
    this.variance = props.variance ?? parseFloat((this.actualScore - this.predictedScore).toFixed(2));
    this.calibrationDelta = props.calibrationDelta ?? Math.abs(this.variance);
    this.recordedAt = props.recordedAt ?? new Date();
  }

  // Compatibility getters
  get predictedReadiness(): number { return this.predictedScore; }
  get actualExamResult(): number { return this.actualScore; }

  public static record(props: {
    predictionId: string;
    studentId: string;
    predictedReadiness: number;
    actualExamResult: number;
    calibrationFactor?: number;
  }): PredictionOutcome {
    const variance = parseFloat((props.actualExamResult - props.predictedReadiness).toFixed(2));
    const factor = props.calibrationFactor ?? 1.0;
    const calibrationDelta = parseFloat((variance * factor).toFixed(2));
    return new PredictionOutcome({
      id: randomUUID(),
      predictionId: props.predictionId,
      studentId: props.studentId,
      predictedScore: props.predictedReadiness,
      actualScore: props.actualExamResult,
      variance,
      calibrationDelta
    });
  }

  public static create(props: {
    predictionId: string;
    studentId: string;
    predictedScore: number;
    actualScore: number;
  }): PredictionOutcome {
    return new PredictionOutcome({
      id: randomUUID(),
      ...props
    });
  }
}

export class LearningVelocity extends ValueObject<{ value: number; unit: string; calculatedAt: Date }> {
  constructor(value: number, unit = 'competencies_per_week', calculatedAt = new Date()) {
    if (value < 0) throw new Error('Learning velocity cannot be negative');
    super({ value, unit, calculatedAt });
  }
  get value(): number { return this.props.value; }
  get unit(): string { return this.props.unit; }
  get calculatedAt(): Date { return this.props.calculatedAt; }
}

export class LearningVelocitySnapshot extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly activeHours: number;
  public readonly questionsAnswered: number;
  public readonly accelerationRate: number;
  public readonly stagnationIndicator: boolean;
  public readonly recordedAt: Date;
  // For compatibility
  public readonly velocity?: LearningVelocity;

  constructor(props: {
    id: string;
    studentId: string;
    activeHours?: number;
    questionsAnswered?: number;
    accelerationRate?: number;
    stagnationIndicator?: boolean;
    recordedAt?: Date;
    velocity?: LearningVelocity;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.activeHours = props.activeHours ?? props.velocity?.value ?? 0;
    this.questionsAnswered = props.questionsAnswered ?? 0;
    this.accelerationRate = props.accelerationRate ?? 0;
    this.stagnationIndicator = props.stagnationIndicator ?? false;
    this.recordedAt = props.recordedAt ?? props.velocity?.calculatedAt ?? new Date();
    this.velocity = props.velocity ?? new LearningVelocity(this.activeHours, 'competencies_per_week', this.recordedAt);
  }

  public static create(props: {
    studentId: string;
    activeHours: number;
    questionsAnswered: number;
    accelerationRate: number;
    stagnationIndicator: boolean;
  }): LearningVelocitySnapshot {
    return new LearningVelocitySnapshot({
      id: randomUUID(),
      ...props
    });
  }
}

export class PredictionLifecycleMetrics extends Entity<string> {
  public readonly modelVersionId: string;
  public readonly measuredAt: Date;
  public readonly generationLatencyMs: number;
  public readonly predictionAcceptanceRate: number;
  public readonly interventionCompletionRate: number;
  public readonly interventionEffectiveness: number;
  public readonly modelDrift: number;
  public readonly experimentSuccessRate: number;

  constructor(props: {
    id: string;
    modelVersionId: string;
    measuredAt?: Date;
    generationLatencyMs: number;
    predictionAcceptanceRate: number;
    interventionCompletionRate: number;
    interventionEffectiveness: number;
    modelDrift: number;
    experimentSuccessRate: number;
  }) {
    super(props.id);
    this.modelVersionId = props.modelVersionId;
    this.measuredAt = props.measuredAt ?? new Date();
    this.generationLatencyMs = props.generationLatencyMs;
    this.predictionAcceptanceRate = props.predictionAcceptanceRate;
    this.interventionCompletionRate = props.interventionCompletionRate;
    this.interventionEffectiveness = props.interventionEffectiveness;
    this.modelDrift = props.modelDrift;
    this.experimentSuccessRate = props.experimentSuccessRate;
  }
}

