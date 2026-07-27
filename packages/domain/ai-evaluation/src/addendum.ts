import { randomUUID } from 'crypto';
import { ValueObject, Entity, AggregateRoot } from '@clasptek/kernel';
import type { DomainEvent, AIProvider, EvaluationPrompt } from './index';

// ═══════════════════════════════════════════════════════════════════
// SPRINT 2.8 ADDENDUM — AI EVALUATION QA ENHANCEMENTS
// Extends packages/domain/ai-evaluation without modifying existing code
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// SECTION 1: ADDENDUM DOMAIN EVENTS
// ───────────────────────────────────────────────────────────────────

export class PromptExperimentStarted implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'PromptExperimentStarted';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class PromptExperimentCompleted implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'PromptExperimentCompleted';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class BenchmarkRunStarted implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'BenchmarkRunStarted';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class BenchmarkRunCompleted implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'BenchmarkRunCompleted';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class RegressionDetected implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'RegressionDetected';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class DeploymentDecisionMade implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'DeploymentDecisionMade';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class DatasetLocked implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();
  public readonly eventName = 'DatasetLocked';
  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

// ───────────────────────────────────────────────────────────────────
// SECTION 2: ADDENDUM VALUE OBJECTS
// ───────────────────────────────────────────────────────────────────

/** Agreement rate between AI and human scores (0.0–1.0) */
export class AgreementRate extends ValueObject<{ rate: number }> {
  constructor(rate: number) {
    if (rate < 0 || rate > 1) throw new Error('AgreementRate must be between 0.0 and 1.0');
    super({ rate });
  }
  get rate(): number {
    return this.props.rate;
  }
  get isAcceptable(): boolean {
    return this.props.rate >= 0.8;
  }
  get isGood(): boolean {
    return this.props.rate >= 0.85;
  }
  get isExcellent(): boolean {
    return this.props.rate >= 0.92;
  }
  get percentage(): number {
    return Math.round(this.props.rate * 100 * 10) / 10;
  }
}

/** Calibration accuracy — how well AI confidence tracks actual correctness (0.0–1.0) */
export class CalibrationAccuracy extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 1) throw new Error('CalibrationAccuracy must be between 0.0 and 1.0');
    super({ value });
  }
  get value(): number {
    return this.props.value;
  }
  get isCalibrated(): boolean {
    return this.props.value >= 0.75;
  }
  get isWellCalibrated(): boolean {
    return this.props.value >= 0.85;
  }
}

/** Distribution of confidence scores across a sample */
export class ConfidenceDistribution extends ValueObject<{
  mean: number;
  stddev: number;
  p10: number;
  p90: number;
  sampleCount: number;
}> {
  constructor(mean: number, stddev: number, p10: number, p90: number, sampleCount: number) {
    if (mean < 0 || mean > 1) throw new Error('ConfidenceDistribution mean must be 0.0–1.0');
    if (stddev < 0) throw new Error('ConfidenceDistribution stddev cannot be negative');
    super({ mean, stddev, p10, p90, sampleCount });
  }
  get mean(): number {
    return this.props.mean;
  }
  get stddev(): number {
    return this.props.stddev;
  }
  get p10(): number {
    return this.props.p10;
  }
  get p90(): number {
    return this.props.p90;
  }
  get sampleCount(): number {
    return this.props.sampleCount;
  }
  get isConsistent(): boolean {
    return this.props.stddev <= 0.15;
  }
}

/** Evaluation cost in USD per-run or per-sample */
export class EvaluationCost extends ValueObject<{
  totalUsd: number;
  perSampleUsd: number;
  currency: string;
}> {
  constructor(totalUsd: number, perSampleUsd: number, currency = 'USD') {
    if (totalUsd < 0) throw new Error('EvaluationCost totalUsd cannot be negative');
    if (perSampleUsd < 0) throw new Error('EvaluationCost perSampleUsd cannot be negative');
    super({ totalUsd, perSampleUsd, currency });
  }
  get totalUsd(): number {
    return this.props.totalUsd;
  }
  get perSampleUsd(): number {
    return this.props.perSampleUsd;
  }
  get currency(): string {
    return this.props.currency;
  }
}

/** Average latency in milliseconds for evaluation execution */
export class AverageLatency extends ValueObject<{
  avgMs: number;
  p95Ms: number;
  sampleCount: number;
}> {
  constructor(avgMs: number, p95Ms: number, sampleCount: number) {
    if (avgMs < 0) throw new Error('AverageLatency avgMs cannot be negative');
    super({ avgMs, p95Ms, sampleCount });
  }
  get avgMs(): number {
    return this.props.avgMs;
  }
  get p95Ms(): number {
    return this.props.p95Ms;
  }
  get sampleCount(): number {
    return this.props.sampleCount;
  }
  /** Within SLA (<= 150ms p95) */
  get isWithinSLA(): boolean {
    return this.props.p95Ms <= 150;
  }
}

/** Measured score drift between two versions or time periods */
export class ScoreDrift extends ValueObject<{
  delta: number;
  deltaPercent: number;
  indicator: 'STABLE' | 'DRIFTING_UP' | 'DRIFTING_DOWN' | 'VOLATILE';
}> {
  constructor(delta: number, deltaPercent: number) {
    const indicator =
      Math.abs(delta) <= 0.05
        ? 'STABLE'
        : delta > 0
          ? 'DRIFTING_UP'
          : deltaPercent > 15
            ? 'VOLATILE'
            : 'DRIFTING_DOWN';
    super({ delta, deltaPercent, indicator });
  }
  get delta(): number {
    return this.props.delta;
  }
  get deltaPercent(): number {
    return this.props.deltaPercent;
  }
  get indicator(): string {
    return this.props.indicator;
  }
  get isSignificant(): boolean {
    return Math.abs(this.props.delta) > 0.1;
  }
}

/** Composite regression score summarising quality degradation */
export class RegressionScore extends ValueObject<{
  value: number;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}> {
  constructor(value: number) {
    if (value < 0) throw new Error('RegressionScore value cannot be negative');
    const severity =
      value === 0
        ? 'NONE'
        : value < 0.05
          ? 'LOW'
          : value < 0.1
            ? 'MEDIUM'
            : value < 0.2
              ? 'HIGH'
              : 'CRITICAL';
    super({ value, severity });
  }
  get value(): number {
    return this.props.value;
  }
  get severity(): string {
    return this.props.severity;
  }
  get requiresBlock(): boolean {
    return this.props.severity === 'CRITICAL' || this.props.severity === 'HIGH';
  }
}

/** Encapsulates a rubric version identifier */
export class RubricVersion extends ValueObject<{ code: string; version: string }> {
  constructor(code: string, version: string) {
    if (!code) throw new Error('RubricVersion code cannot be empty');
    if (!version) throw new Error('RubricVersion version cannot be empty');
    super({ code, version });
  }
  get code(): string {
    return this.props.code;
  }
  get version(): string {
    return this.props.version;
  }
  get key(): string {
    return `${this.props.code}@${this.props.version}`;
  }
}

/** Encapsulates an AI model version identifier */
export class ModelVersion extends ValueObject<{
  modelCode: string;
  provider: string;
  version: string;
}> {
  constructor(modelCode: string, provider: string, version: string) {
    if (!modelCode) throw new Error('ModelVersion modelCode cannot be empty');
    if (!provider) throw new Error('ModelVersion provider cannot be empty');
    super({ modelCode, provider, version });
  }
  get modelCode(): string {
    return this.props.modelCode;
  }
  get provider(): string {
    return this.props.provider;
  }
  get version(): string {
    return this.props.version;
  }
  get key(): string {
    return `${this.props.provider}/${this.props.modelCode}@${this.props.version}`;
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 3: ADDENDUM ENTITIES
// ───────────────────────────────────────────────────────────────────

/** A single pairwise comparison between baseline and candidate prompt versions */
export class PromptComparison extends Entity<string> {
  public readonly experimentId: string;
  public readonly submissionId: string;
  public readonly questionType: string;
  public readonly baselineScore: number | undefined;
  public readonly candidateScore: number | undefined;
  public readonly scoreDifference: number | undefined;
  public readonly humanScore: number | undefined;
  public readonly baselineAgreesHuman: boolean | undefined;
  public readonly candidateAgreesHuman: boolean | undefined;
  public readonly baselineConfidence: number | undefined;
  public readonly candidateConfidence: number | undefined;
  public readonly baselineLatencyMs: number | undefined;
  public readonly candidateLatencyMs: number | undefined;
  public readonly baselineCostUsd: number | undefined;
  public readonly candidateCostUsd: number | undefined;
  public readonly instructorOverrode: boolean;
  public readonly instructorOverrideScore: number | undefined;
  public readonly evaluatedAt: Date;

  constructor(props: {
    id: string;
    experimentId: string;
    submissionId: string;
    questionType: string;
    baselineScore?: number | undefined;
    candidateScore?: number | undefined;
    scoreDifference?: number | undefined;
    humanScore?: number | undefined;
    baselineAgreesHuman?: boolean | undefined;
    candidateAgreesHuman?: boolean | undefined;
    baselineConfidence?: number | undefined;
    candidateConfidence?: number | undefined;
    baselineLatencyMs?: number | undefined;
    candidateLatencyMs?: number | undefined;
    baselineCostUsd?: number | undefined;
    candidateCostUsd?: number | undefined;
    instructorOverrode?: boolean | undefined;
    instructorOverrideScore?: number | undefined;
    evaluatedAt?: Date | undefined;
  }) {
    super(props.id);
    this.experimentId = props.experimentId;
    this.submissionId = props.submissionId;
    this.questionType = props.questionType;
    this.baselineScore = props.baselineScore;
    this.candidateScore = props.candidateScore;
    this.scoreDifference = props.scoreDifference;
    this.humanScore = props.humanScore;
    this.baselineAgreesHuman = props.baselineAgreesHuman;
    this.candidateAgreesHuman = props.candidateAgreesHuman;
    this.baselineConfidence = props.baselineConfidence;
    this.candidateConfidence = props.candidateConfidence;
    this.baselineLatencyMs = props.baselineLatencyMs;
    this.candidateLatencyMs = props.candidateLatencyMs;
    this.baselineCostUsd = props.baselineCostUsd;
    this.candidateCostUsd = props.candidateCostUsd;
    this.instructorOverrode = props.instructorOverrode ?? false;
    this.instructorOverrideScore = props.instructorOverrideScore;
    this.evaluatedAt = props.evaluatedAt ?? new Date();
  }
}

/** Aggregated performance metrics for a prompt version within an experiment */
export class PromptPerformanceMetric extends Entity<string> {
  public readonly experimentId: string;
  public readonly promptVersionId: string;
  public readonly rubricVersion: string | undefined;
  public readonly modelVersion: string | undefined;
  public readonly questionType: string | undefined;
  public readonly sampleCount: number;
  public readonly agreementRate: AgreementRate | undefined;
  public readonly calibrationAccuracy: CalibrationAccuracy | undefined;
  public readonly instructorOverrideRate: number | undefined;
  public readonly avgScoreDifference: number | undefined;
  public readonly scoreDrift: ScoreDrift | undefined;
  public readonly falsePositiveRate: number | undefined;
  public readonly falseNegativeRate: number | undefined;
  public readonly confidenceDistribution: ConfidenceDistribution | undefined;
  public readonly averageLatency: AverageLatency | undefined;
  public readonly evaluationCost: EvaluationCost | undefined;
  public readonly computedAt: Date;

  constructor(props: {
    id: string;
    experimentId: string;
    promptVersionId: string;
    rubricVersion?: string | undefined;
    modelVersion?: string | undefined;
    questionType?: string | undefined;
    sampleCount: number;
    agreementRate?: AgreementRate | undefined;
    calibrationAccuracy?: CalibrationAccuracy | undefined;
    instructorOverrideRate?: number | undefined;
    avgScoreDifference?: number | undefined;
    scoreDrift?: ScoreDrift | undefined;
    falsePositiveRate?: number | undefined;
    falseNegativeRate?: number | undefined;
    confidenceDistribution?: ConfidenceDistribution | undefined;
    averageLatency?: AverageLatency | undefined;
    evaluationCost?: EvaluationCost | undefined;
    computedAt?: Date | undefined;
  }) {
    super(props.id);
    this.experimentId = props.experimentId;
    this.promptVersionId = props.promptVersionId;
    this.rubricVersion = props.rubricVersion;
    this.modelVersion = props.modelVersion;
    this.questionType = props.questionType;
    this.sampleCount = props.sampleCount;
    this.agreementRate = props.agreementRate;
    this.calibrationAccuracy = props.calibrationAccuracy;
    this.instructorOverrideRate = props.instructorOverrideRate;
    this.avgScoreDifference = props.avgScoreDifference;
    this.scoreDrift = props.scoreDrift;
    this.falsePositiveRate = props.falsePositiveRate;
    this.falseNegativeRate = props.falseNegativeRate;
    this.confidenceDistribution = props.confidenceDistribution;
    this.averageLatency = props.averageLatency;
    this.evaluationCost = props.evaluationCost;
    this.computedAt = props.computedAt ?? new Date();
  }
}

/** A single item within a benchmark dataset */
export class BenchmarkDatasetItem extends Entity<string> {
  public readonly datasetId: string;
  public readonly itemIndex: number;
  public readonly submissionText: string;
  public readonly questionText: string | undefined;
  public readonly questionType: string;
  public readonly humanScore: number;
  public readonly humanBand: string | undefined;
  public readonly rubricScores: Record<string, number>;

  constructor(props: {
    id: string;
    datasetId: string;
    itemIndex: number;
    submissionText: string;
    questionText?: string;
    questionType: string;
    humanScore: number;
    humanBand?: string;
    rubricScores?: Record<string, number>;
  }) {
    super(props.id);
    this.datasetId = props.datasetId;
    this.itemIndex = props.itemIndex;
    this.submissionText = props.submissionText;
    this.questionText = props.questionText;
    this.questionType = props.questionType;
    this.humanScore = props.humanScore;
    this.humanBand = props.humanBand;
    this.rubricScores = props.rubricScores ?? {};
  }
}

/** Result for a single item within a benchmark run */
export class BenchmarkResult extends Entity<string> {
  public readonly runId: string;
  public readonly datasetItemId: string;
  public readonly aiScore: number | undefined;
  public readonly humanScore: number;
  public readonly scoreDifference: number | undefined;
  public readonly agreesWithHuman: boolean | undefined;
  public readonly confidence: number | undefined;
  public readonly latencyMs: number | undefined;
  public readonly costUsd: number | undefined;
  public readonly tokenCount: number | undefined;
  public readonly isFalsePositive: boolean | undefined;
  public readonly isFalseNegative: boolean | undefined;
  public readonly evaluatedAt: Date;

  constructor(props: {
    id: string;
    runId: string;
    datasetItemId: string;
    aiScore?: number | undefined;
    humanScore: number;
    scoreDifference?: number | undefined;
    agreesWithHuman?: boolean | undefined;
    confidence?: number | undefined;
    latencyMs?: number | undefined;
    costUsd?: number | undefined;
    tokenCount?: number | undefined;
    isFalsePositive?: boolean | undefined;
    isFalseNegative?: boolean | undefined;
    evaluatedAt?: Date | undefined;
  }) {
    super(props.id);
    this.runId = props.runId;
    this.datasetItemId = props.datasetItemId;
    this.aiScore = props.aiScore;
    this.humanScore = props.humanScore;
    this.scoreDifference = props.scoreDifference;
    this.agreesWithHuman = props.agreesWithHuman;
    this.confidence = props.confidence;
    this.latencyMs = props.latencyMs;
    this.costUsd = props.costUsd;
    this.tokenCount = props.tokenCount;
    this.isFalsePositive = props.isFalsePositive;
    this.isFalseNegative = props.isFalseNegative;
    this.evaluatedAt = props.evaluatedAt ?? new Date();
  }
}

/** A detected regression between a current and baseline benchmark run */
export class BenchmarkRegression extends Entity<string> {
  public readonly runId: string;
  public readonly baselineRunId: string | undefined;
  public readonly regressionType: string;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly currentValue: number;
  public readonly baselineValue: number | undefined;
  public readonly thresholdValue: number | undefined;
  public readonly delta: number | undefined;
  public readonly deltaPercent: number | undefined;
  public readonly description: string | undefined;
  public readonly isResolved: boolean;
  public readonly detectedAt: Date;

  constructor(props: {
    id: string;
    runId: string;
    baselineRunId?: string | undefined;
    regressionType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    currentValue: number;
    baselineValue?: number | undefined;
    thresholdValue?: number | undefined;
    delta?: number | undefined;
    deltaPercent?: number | undefined;
    description?: string | undefined;
    isResolved?: boolean | undefined;
    detectedAt?: Date | undefined;
  }) {
    super(props.id);
    this.runId = props.runId;
    this.baselineRunId = props.baselineRunId;
    this.regressionType = props.regressionType;
    this.severity = props.severity;
    this.currentValue = props.currentValue;
    this.baselineValue = props.baselineValue;
    this.thresholdValue = props.thresholdValue;
    this.delta = props.delta;
    this.deltaPercent = props.deltaPercent;
    this.description = props.description;
    this.isResolved = props.isResolved ?? false;
    this.detectedAt = props.detectedAt ?? new Date();
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 4: ADDENDUM AGGREGATE ROOTS
// ───────────────────────────────────────────────────────────────────

export type ExperimentStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ExperimentTrigger =
  | 'PROMPT_CHANGE'
  | 'RUBRIC_CHANGE'
  | 'MODEL_CHANGE'
  | 'SCORING_LOGIC_CHANGE'
  | 'PIPELINE_CHANGE'
  | 'MANUAL';

/** Prompt experiment aggregate — orchestrates a comparison between two prompt versions */
export class PromptExperiment extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly name: string;
  public readonly description: string | undefined;
  public readonly promptTemplateId: string | undefined;
  public readonly baselineVersionId: string;
  public readonly candidateVersionId: string;
  public readonly rubricVersion: string | undefined;
  public readonly modelVersion: string | undefined;
  public readonly questionTypeTarget: string | undefined;
  public readonly triggerReason: ExperimentTrigger;
  private _status: ExperimentStatus;
  private _comparisons: PromptComparison[];
  private _metrics: PromptPerformanceMetric | undefined;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  private _startedAt: Date | undefined;
  private _completedAt: Date | undefined;

  constructor(props: {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    promptTemplateId?: string;
    baselineVersionId: string;
    candidateVersionId: string;
    rubricVersion?: string;
    modelVersion?: string;
    questionTypeTarget?: string;
    triggerReason: ExperimentTrigger;
    status?: ExperimentStatus;
    comparisons?: PromptComparison[];
    metrics?: PromptPerformanceMetric;
    createdBy: string;
    createdAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.description = props.description;
    this.promptTemplateId = props.promptTemplateId;
    this.baselineVersionId = props.baselineVersionId;
    this.candidateVersionId = props.candidateVersionId;
    this.rubricVersion = props.rubricVersion;
    this.modelVersion = props.modelVersion;
    this.questionTypeTarget = props.questionTypeTarget;
    this.triggerReason = props.triggerReason;
    this._status = props.status ?? 'PENDING';
    this._comparisons = props.comparisons ?? [];
    this._metrics = props.metrics;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt ?? new Date();
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
  }

  get status(): ExperimentStatus {
    return this._status;
  }
  get comparisons(): readonly PromptComparison[] {
    return this._comparisons;
  }
  get metrics(): PromptPerformanceMetric | undefined {
    return this._metrics;
  }
  get startedAt(): Date | undefined {
    return this._startedAt;
  }
  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public start(at: Date = new Date()): void {
    if (this._status !== 'PENDING')
      throw new Error(`Cannot start experiment in status '${this._status}'`);
    this._status = 'RUNNING';
    this._startedAt = at;
    this.addDomainEvent(new PromptExperimentStarted(this.id, { name: this.name }));
  }

  public addComparison(comparison: PromptComparison): void {
    if (this._status !== 'RUNNING')
      throw new Error('Cannot add comparisons unless experiment is RUNNING');
    this._comparisons.push(comparison);
  }

  public complete(metrics: PromptPerformanceMetric, at: Date = new Date()): void {
    if (this._status !== 'RUNNING')
      throw new Error(`Cannot complete experiment in status '${this._status}'`);
    this._status = 'COMPLETED';
    this._metrics = metrics;
    this._completedAt = at;
    this.addDomainEvent(
      new PromptExperimentCompleted(this.id, {
        agreementRate: metrics.agreementRate?.rate,
        sampleCount: metrics.sampleCount,
      })
    );
  }

  public fail(reason: string): void {
    this._status = 'FAILED';
    this.addDomainEvent(new PromptExperimentCompleted(this.id, { error: reason }));
  }

  public static create(props: {
    tenantId: string;
    name: string;
    baselineVersionId: string;
    candidateVersionId: string;
    triggerReason: ExperimentTrigger;
    createdBy: string;
    description?: string;
    promptTemplateId?: string;
    rubricVersion?: string;
    modelVersion?: string;
    questionTypeTarget?: string;
  }): PromptExperiment {
    return new PromptExperiment({ id: randomUUID(), ...props });
  }
}

export type DatasetStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

/** Benchmark dataset aggregate — immutable golden-truth dataset for regression testing */
export class BenchmarkDataset extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly name: string;
  public readonly description: string | undefined;
  public readonly questionType: string;
  public readonly examContext: string | undefined;
  private _items: BenchmarkDatasetItem[];
  private _isLocked: boolean;
  private _lockedAt: Date | undefined;
  private _lockedBy: string | undefined;
  private _lockHash: string | undefined;
  public readonly version: string;
  private _status: DatasetStatus;
  public readonly createdBy: string;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    questionType: string;
    examContext?: string;
    items?: BenchmarkDatasetItem[];
    isLocked?: boolean;
    lockedAt?: Date;
    lockedBy?: string;
    lockHash?: string;
    version?: string;
    status?: DatasetStatus;
    createdBy: string;
    createdAt?: Date;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.description = props.description;
    this.questionType = props.questionType;
    this.examContext = props.examContext;
    this._items = props.items ?? [];
    this._isLocked = props.isLocked ?? false;
    this._lockedAt = props.lockedAt;
    this._lockedBy = props.lockedBy;
    this._lockHash = props.lockHash;
    this.version = props.version ?? '1.0.0';
    this._status = props.status ?? 'DRAFT';
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt ?? new Date();
  }

  get items(): readonly BenchmarkDatasetItem[] {
    return this._items;
  }
  get isLocked(): boolean {
    return this._isLocked;
  }
  get lockedAt(): Date | undefined {
    return this._lockedAt;
  }
  get lockedBy(): string | undefined {
    return this._lockedBy;
  }
  get lockHash(): string | undefined {
    return this._lockHash;
  }
  get status(): DatasetStatus {
    return this._status;
  }
  get sampleCount(): number {
    return this._items.length;
  }

  public addItem(item: BenchmarkDatasetItem): void {
    if (this._isLocked) throw new Error('Cannot add items to a locked BenchmarkDataset');
    if (item.datasetId !== this.id)
      throw new Error('Item datasetId does not match BenchmarkDataset id');
    this._items.push(item);
  }

  public lock(lockedBy: string, lockHash: string, at: Date = new Date()): void {
    if (this._isLocked) throw new Error('BenchmarkDataset is already locked');
    if (this._items.length === 0) throw new Error('Cannot lock an empty BenchmarkDataset');
    this._isLocked = true;
    this._lockedAt = at;
    this._lockedBy = lockedBy;
    this._lockHash = lockHash;
    this._status = 'ACTIVE';
    this.addDomainEvent(new DatasetLocked(this.id, { sampleCount: this._items.length, lockHash }));
  }

  public deprecate(): void {
    this._status = 'DEPRECATED';
  }

  public static create(props: {
    tenantId: string;
    name: string;
    questionType: string;
    createdBy: string;
    description?: string;
    examContext?: string;
    version?: string;
  }): BenchmarkDataset {
    return new BenchmarkDataset({ id: randomUUID(), ...props });
  }
}

export type BenchmarkRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type BenchmarkTriggerType =
  | 'PROMPT_CHANGE'
  | 'RUBRIC_CHANGE'
  | 'MODEL_CHANGE'
  | 'SCORING_CHANGE'
  | 'PIPELINE_CHANGE'
  | 'MANUAL'
  | 'SCHEDULED';

/** Benchmark run aggregate — a single execution of a benchmark dataset against an AI config */
export class BenchmarkRun extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly datasetId: string;
  public readonly experimentId: string | undefined;
  public readonly promptVersionId: string | undefined;
  public readonly rubricVersion: string | undefined;
  public readonly modelVersion: string | undefined;
  public readonly modelCode: string | undefined;
  public readonly provider: string | undefined;
  public readonly triggerType: BenchmarkTriggerType;
  private _status: BenchmarkRunStatus;
  private _results: BenchmarkResult[];
  private _regressions: BenchmarkRegression[];
  // Aggregate metrics (computed on completion)
  public agreementRate: AgreementRate | undefined;
  public calibrationAccuracy: CalibrationAccuracy | undefined;
  public avgScoreDifference: number | undefined;
  public falsePositiveRate: number | undefined;
  public falseNegativeRate: number | undefined;
  public averageLatency: AverageLatency | undefined;
  public evaluationCost: EvaluationCost | undefined;
  public totalItems: number;
  public processedItems: number;
  public failedItems: number;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  private _startedAt: Date | undefined;
  private _completedAt: Date | undefined;

  constructor(props: {
    id: string;
    tenantId: string;
    datasetId: string;
    experimentId?: string | undefined;
    promptVersionId?: string | undefined;
    rubricVersion?: string | undefined;
    modelVersion?: string | undefined;
    modelCode?: string | undefined;
    provider?: string | undefined;
    triggerType: BenchmarkTriggerType;
    status?: BenchmarkRunStatus | undefined;
    results?: BenchmarkResult[] | undefined;
    regressions?: BenchmarkRegression[] | undefined;
    agreementRate?: AgreementRate | undefined;
    calibrationAccuracy?: CalibrationAccuracy | undefined;
    avgScoreDifference?: number | undefined;
    falsePositiveRate?: number | undefined;
    falseNegativeRate?: number | undefined;
    averageLatency?: AverageLatency | undefined;
    evaluationCost?: EvaluationCost | undefined;
    totalItems?: number | undefined;
    processedItems?: number | undefined;
    failedItems?: number | undefined;
    createdBy: string;
    createdAt?: Date | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.datasetId = props.datasetId;
    this.experimentId = props.experimentId;
    this.promptVersionId = props.promptVersionId;
    this.rubricVersion = props.rubricVersion;
    this.modelVersion = props.modelVersion;
    this.modelCode = props.modelCode;
    this.provider = props.provider;
    this.triggerType = props.triggerType;
    this._status = props.status ?? 'PENDING';
    this._results = props.results ?? [];
    this._regressions = props.regressions ?? [];
    this.agreementRate = props.agreementRate;
    this.calibrationAccuracy = props.calibrationAccuracy;
    this.avgScoreDifference = props.avgScoreDifference;
    this.falsePositiveRate = props.falsePositiveRate;
    this.falseNegativeRate = props.falseNegativeRate;
    this.averageLatency = props.averageLatency;
    this.evaluationCost = props.evaluationCost;
    this.totalItems = props.totalItems ?? 0;
    this.processedItems = props.processedItems ?? 0;
    this.failedItems = props.failedItems ?? 0;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt ?? new Date();
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
  }

  get status(): BenchmarkRunStatus {
    return this._status;
  }
  get results(): readonly BenchmarkResult[] {
    return this._results;
  }
  get regressions(): readonly BenchmarkRegression[] {
    return this._regressions;
  }
  get startedAt(): Date | undefined {
    return this._startedAt;
  }
  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public start(totalItems: number, at: Date = new Date()): void {
    if (this._status !== 'PENDING')
      throw new Error(`Cannot start BenchmarkRun in status '${this._status}'`);
    this._status = 'RUNNING';
    this.totalItems = totalItems;
    this._startedAt = at;
    this.addDomainEvent(
      new BenchmarkRunStarted(this.id, { datasetId: this.datasetId, totalItems })
    );
  }

  public addResult(result: BenchmarkResult): void {
    if (this._status !== 'RUNNING') throw new Error('Cannot add results unless run is RUNNING');
    this._results.push(result);
    this.processedItems += 1;
  }

  public addRegression(regression: BenchmarkRegression): void {
    this._regressions.push(regression);
  }

  public complete(
    metrics: {
      agreementRate: AgreementRate;
      calibrationAccuracy: CalibrationAccuracy;
      avgScoreDifference: number;
      falsePositiveRate: number;
      falseNegativeRate: number;
      averageLatency: AverageLatency;
      evaluationCost: EvaluationCost;
    },
    at: Date = new Date()
  ): void {
    if (this._status !== 'RUNNING')
      throw new Error(`Cannot complete BenchmarkRun in status '${this._status}'`);
    this._status = 'COMPLETED';
    this.agreementRate = metrics.agreementRate;
    this.calibrationAccuracy = metrics.calibrationAccuracy;
    this.avgScoreDifference = metrics.avgScoreDifference;
    this.falsePositiveRate = metrics.falsePositiveRate;
    this.falseNegativeRate = metrics.falseNegativeRate;
    this.averageLatency = metrics.averageLatency;
    this.evaluationCost = metrics.evaluationCost;
    this._completedAt = at;
    this.addDomainEvent(
      new BenchmarkRunCompleted(this.id, {
        agreementRate: metrics.agreementRate.rate,
        regressionCount: this._regressions.length,
      })
    );
  }

  public fail(_reason: string): void {
    this._status = 'FAILED';
  }

  public static create(props: {
    tenantId: string;
    datasetId: string;
    triggerType: BenchmarkTriggerType;
    createdBy: string;
    experimentId?: string | undefined;
    promptVersionId?: string | undefined;
    rubricVersion?: string | undefined;
    modelVersion?: string | undefined;
    modelCode?: string | undefined;
    provider?: string | undefined;
  }): BenchmarkRun {
    return new BenchmarkRun({ id: randomUUID(), ...props });
  }
}

export type DeploymentVerdict = 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';

/** Deployment decision aggregate — records an automated go/no-go verdict */
export class DeploymentDecision extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly runId: string;
  public readonly experimentId: string | undefined;
  public readonly verdict: DeploymentVerdict;
  public readonly agreementRate: number | undefined;
  public readonly calibrationAccuracy: number | undefined;
  public readonly regressionCount: number;
  public readonly criticalRegressions: number;
  public readonly decisionReason: string;
  public readonly thresholdsApplied: Record<string, number>;
  public readonly decidedBy: string;
  public readonly decidedAt: Date;
  private _reviewedBy: string | undefined;
  private _reviewedAt: Date | undefined;

  constructor(props: {
    id: string;
    tenantId: string;
    runId: string;
    experimentId?: string | undefined;
    verdict: DeploymentVerdict;
    agreementRate?: number | undefined;
    calibrationAccuracy?: number | undefined;
    regressionCount: number;
    criticalRegressions: number;
    decisionReason: string;
    thresholdsApplied?: Record<string, number> | undefined;
    decidedBy?: string | undefined;
    decidedAt?: Date | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: Date | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.runId = props.runId;
    this.experimentId = props.experimentId;
    this.verdict = props.verdict;
    this.agreementRate = props.agreementRate;
    this.calibrationAccuracy = props.calibrationAccuracy;
    this.regressionCount = props.regressionCount;
    this.criticalRegressions = props.criticalRegressions;
    this.decisionReason = props.decisionReason;
    this.thresholdsApplied = props.thresholdsApplied ?? {};
    this.decidedBy = props.decidedBy ?? 'SYSTEM';
    this.decidedAt = props.decidedAt ?? new Date();
    this._reviewedBy = props.reviewedBy;
    this._reviewedAt = props.reviewedAt;
  }

  get reviewedBy(): string | undefined {
    return this._reviewedBy;
  }
  get reviewedAt(): Date | undefined {
    return this._reviewedAt;
  }

  public humanReview(reviewedBy: string, at: Date = new Date()): void {
    this._reviewedBy = reviewedBy;
    this._reviewedAt = at;
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 5: DOMAIN SERVICES
// ───────────────────────────────────────────────────────────────────

export interface PromptComparisonResult {
  comparisons: PromptComparison[];
  metrics: PromptPerformanceMetric;
  baselineAgreementRate: AgreementRate;
  candidateAgreementRate: AgreementRate;
  scoreDrift: ScoreDrift;
  latencyDeltaMs: number;
  costDeltaUsd: number;
  candidateImproves: boolean;
}

export class PromptComparisonEngine {
  /**
   * Compares pairs of AI evaluations from baseline and candidate prompt versions
   * against human gold-standard scores, producing pairwise comparisons and
   * aggregated performance metrics.
   */
  public compare(params: {
    experimentId: string;
    promptVersionId: string;
    samples: Array<{
      submissionId: string;
      questionType: string;
      humanScore: number;
      baselineScore: number;
      baselineConfidence: number;
      baselineLatencyMs: number;
      baselineCostUsd: number;
      candidateScore: number;
      candidateConfidence: number;
      candidateLatencyMs: number;
      candidateCostUsd: number;
      instructorOverrode: boolean;
      instructorOverrideScore?: number;
    }>;
    rubricVersion?: string;
    modelVersion?: string;
  }): PromptComparisonResult {
    const { experimentId, promptVersionId, samples } = params;

    if (samples.length === 0) {
      throw new Error('PromptComparisonEngine requires at least one sample');
    }

    // Build pairwise comparisons
    const comparisons: PromptComparison[] = samples.map((s) => {
      const threshold = 0.5; // agree if |ai - human| <= 0.5 band
      return new PromptComparison({
        id: randomUUID(),
        experimentId,
        submissionId: s.submissionId,
        questionType: s.questionType,
        baselineScore: s.baselineScore,
        candidateScore: s.candidateScore,
        scoreDifference: s.candidateScore - s.baselineScore,
        humanScore: s.humanScore,
        baselineAgreesHuman: Math.abs(s.baselineScore - s.humanScore) <= threshold,
        candidateAgreesHuman: Math.abs(s.candidateScore - s.humanScore) <= threshold,
        baselineConfidence: s.baselineConfidence,
        candidateConfidence: s.candidateConfidence,
        baselineLatencyMs: s.baselineLatencyMs,
        candidateLatencyMs: s.candidateLatencyMs,
        baselineCostUsd: s.baselineCostUsd,
        candidateCostUsd: s.candidateCostUsd,
        instructorOverrode: s.instructorOverrode,
        instructorOverrideScore: s.instructorOverrideScore,
      });
    });

    const n = samples.length;

    // Agreement rates
    const baselineAgreements = comparisons.filter((c) => c.baselineAgreesHuman).length;
    const candidateAgreements = comparisons.filter((c) => c.candidateAgreesHuman).length;
    const baselineAgreementRate = new AgreementRate(baselineAgreements / n);
    const candidateAgreementRate = new AgreementRate(candidateAgreements / n);

    // Score drift
    const avgBaselineScore = samples.reduce((s, x) => s + x.baselineScore, 0) / n;
    const avgCandidateScore = samples.reduce((s, x) => s + x.candidateScore, 0) / n;
    const delta = avgCandidateScore - avgBaselineScore;
    const scoreDrift = new ScoreDrift(
      delta,
      avgBaselineScore > 0 ? (delta / avgBaselineScore) * 100 : 0
    );

    // Latency comparison
    const avgBaselineLatency = samples.reduce((s, x) => s + x.baselineLatencyMs, 0) / n;
    const avgCandidateLatency = samples.reduce((s, x) => s + x.candidateLatencyMs, 0) / n;
    const latencyDeltaMs = avgCandidateLatency - avgBaselineLatency;

    // Cost comparison
    const totalBaselineCost = samples.reduce((s, x) => s + x.baselineCostUsd, 0);
    const totalCandidateCost = samples.reduce((s, x) => s + x.candidateCostUsd, 0);
    const costDeltaUsd = totalCandidateCost - totalBaselineCost;

    // Confidence distribution for candidate
    const confidences = samples.map((s) => s.candidateConfidence).sort((a, b) => a - b);
    const confMean = confidences.reduce((s, c) => s + c, 0) / n;
    const confVariance = confidences.reduce((s, c) => s + (c - confMean) ** 2, 0) / n;
    const confStddev = Math.sqrt(confVariance);
    const confP10 = confidences[Math.floor(n * 0.1)] ?? confidences[0];
    const confP90 = confidences[Math.floor(n * 0.9)] ?? confidences[n - 1];

    // False positive/negative rates (AI scores > human when human is "low")
    const humanThreshold = 5.0;
    const fpCount = samples.filter(
      (s) => s.humanScore < humanThreshold && s.candidateScore >= humanThreshold
    ).length;
    const fnCount = samples.filter(
      (s) => s.humanScore >= humanThreshold && s.candidateScore < humanThreshold
    ).length;
    const fpRate = fpCount / n;
    const fnRate = fnCount / n;

    // Instructor override rate
    const overrideCount = samples.filter((s) => s.instructorOverrode).length;
    const overrideRate = overrideCount / n;

    // Calibration accuracy (how well AI confidence matches actual correctness)
    const correctPairs = samples.filter(
      (s) => Math.abs(s.candidateScore - s.humanScore) <= 0.5 === s.candidateConfidence >= 0.8
    ).length;
    const calibrationAccuracy = new CalibrationAccuracy(correctPairs / n);

    const avgScoreDiff =
      samples.reduce((s, x) => s + Math.abs(x.candidateScore - x.humanScore), 0) / n;

    const metrics = new PromptPerformanceMetric({
      id: randomUUID(),
      experimentId,
      promptVersionId,
      rubricVersion: params.rubricVersion,
      modelVersion: params.modelVersion,
      sampleCount: n,
      agreementRate: candidateAgreementRate,
      calibrationAccuracy,
      instructorOverrideRate: overrideRate,
      avgScoreDifference: avgScoreDiff,
      scoreDrift,
      falsePositiveRate: fpRate,
      falseNegativeRate: fnRate,
      confidenceDistribution: new ConfidenceDistribution(confMean, confStddev, confP10, confP90, n),
      averageLatency: new AverageLatency(avgCandidateLatency, avgCandidateLatency * 1.5, n),
      evaluationCost: new EvaluationCost(totalCandidateCost, totalCandidateCost / n),
    });

    return {
      comparisons,
      metrics,
      baselineAgreementRate,
      candidateAgreementRate,
      scoreDrift,
      latencyDeltaMs,
      costDeltaUsd,
      candidateImproves: candidateAgreementRate.rate > baselineAgreementRate.rate,
    };
  }

  /** Compute agreement rate for a flat set of comparisons */
  public computeAgreementRate(
    comparisons: Array<{ aiScore: number; humanScore: number; threshold?: number }>
  ): AgreementRate {
    if (comparisons.length === 0) return new AgreementRate(0);
    const agreed = comparisons.filter(
      (c) => Math.abs(c.aiScore - c.humanScore) <= (c.threshold ?? 0.5)
    ).length;
    return new AgreementRate(agreed / comparisons.length);
  }
}

export interface BenchmarkRunSummary {
  runId: string;
  totalItems: number;
  processedItems: number;
  results: BenchmarkResult[];
  agreementRate: AgreementRate;
  calibrationAccuracy: CalibrationAccuracy;
  avgScoreDifference: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  averageLatency: AverageLatency;
  evaluationCost: EvaluationCost;
}

export class BenchmarkEngine {
  constructor(private readonly provider: AIProvider) {}

  /**
   * Executes a benchmark dataset — runs AI evaluation on each item and
   * compares against the human gold-standard score.
   */
  public async execute(params: {
    run: BenchmarkRun;
    dataset: BenchmarkDataset;
    buildPrompt: (item: BenchmarkDatasetItem) => EvaluationPrompt;
    parseScore: (response: string) => { score: number; confidence: number };
    agreementThreshold?: number;
  }): Promise<BenchmarkRunSummary> {
    const { run, dataset, buildPrompt, parseScore } = params;
    const threshold = params.agreementThreshold ?? 0.5;

    if (!dataset.isLocked) {
      throw new Error('BenchmarkDataset must be locked before execution');
    }

    run.start(dataset.sampleCount);

    const results: BenchmarkResult[] = [];
    let totalCostUsd = 0;
    const latencies: number[] = [];

    for (const item of dataset.items) {
      const prompt = buildPrompt(item);
      const startMs = Date.now();
      let aiScore = 0;
      let confidence = 0;

      try {
        const response = await this.provider.evaluate!(prompt);
        const latencyMs = Date.now() - startMs;
        latencies.push(latencyMs);
        const parsed = parseScore(response.content);
        aiScore = parsed.score;
        confidence = parsed.confidence;
        const costUsd = this.provider.estimateCost(
          response.tokenUsage.promptTokens,
          response.tokenUsage.completionTokens
        ).costUsd;
        totalCostUsd += costUsd;

        const agrees = Math.abs(aiScore - item.humanScore) <= threshold;
        const humanLow = item.humanScore < 5.0;
        const aiLow = aiScore < 5.0;

        const result = new BenchmarkResult({
          id: randomUUID(),
          runId: run.id,
          datasetItemId: item.id,
          aiScore,
          humanScore: item.humanScore,
          scoreDifference: aiScore - item.humanScore,
          agreesWithHuman: agrees,
          confidence,
          latencyMs,
          costUsd,
          tokenCount: response.tokenUsage.totalTokens,
          isFalsePositive: humanLow && !aiLow,
          isFalseNegative: !humanLow && aiLow,
        });
        results.push(result);
        run.addResult(result);
      } catch (err) {
        run.failedItems += 1;
      }
    }

    // Compute aggregate metrics
    const n = results.length;
    if (n === 0) {
      run.fail('No results produced');
      throw new Error('BenchmarkEngine: no results produced');
    }

    const agreedCount = results.filter((r) => r.agreesWithHuman).length;
    const agreementRate = new AgreementRate(agreedCount / n);

    const avgScoreDiff = results.reduce((s, r) => s + Math.abs(r.scoreDifference ?? 0), 0) / n;

    const fpCount = results.filter((r) => r.isFalsePositive).length;
    const fnCount = results.filter((r) => r.isFalseNegative).length;

    const avgLatencyMs = latencies.reduce((s, l) => s + l, 0) / (latencies.length || 1);
    const p95LatencyMs =
      latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)] ?? avgLatencyMs;

    // Calibration accuracy
    const correctCalib = results.filter(
      (r) => (r.agreesWithHuman ?? false) === (r.confidence ?? 0) >= 0.8
    ).length;
    const calibrationAccuracy = new CalibrationAccuracy(correctCalib / n);

    const metrics = {
      agreementRate,
      calibrationAccuracy,
      avgScoreDifference: avgScoreDiff,
      falsePositiveRate: fpCount / n,
      falseNegativeRate: fnCount / n,
      averageLatency: new AverageLatency(avgLatencyMs, p95LatencyMs, n),
      evaluationCost: new EvaluationCost(totalCostUsd, totalCostUsd / n),
    };

    run.complete(metrics);

    return {
      runId: run.id,
      totalItems: dataset.sampleCount,
      processedItems: n,
      results,
      ...metrics,
    };
  }
}

export interface DetectedRegression {
  regressionType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentValue: number;
  baselineValue: number;
  thresholdValue: number;
  delta: number;
  deltaPercent: number;
  description: string;
}

export interface RegressionDetectionConfig {
  agreementRateThreshold: number; // default 0.80
  calibrationAccuracyThreshold: number; // default 0.75
  maxScoreDrift: number; // default 0.10
  maxFalsePositiveRate: number; // default 0.10
  maxFalseNegativeRate: number; // default 0.10
  maxAgreementDegradation: number; // max drop vs baseline, default 0.05
}

export const DEFAULT_REGRESSION_CONFIG: RegressionDetectionConfig = {
  agreementRateThreshold: 0.8,
  calibrationAccuracyThreshold: 0.75,
  maxScoreDrift: 0.1,
  maxFalsePositiveRate: 0.1,
  maxFalseNegativeRate: 0.1,
  maxAgreementDegradation: 0.05,
};

export class RegressionDetectionEngine {
  constructor(private readonly config: RegressionDetectionConfig = DEFAULT_REGRESSION_CONFIG) {}

  /**
   * Compares current run metrics against baseline run (or absolute thresholds)
   * and returns all detected regressions.
   */
  public detect(params: {
    runId: string;
    current: {
      agreementRate: number;
      calibrationAccuracy: number;
      avgScoreDifference: number;
      falsePositiveRate: number;
      falseNegativeRate: number;
      avgLatencyMs: number;
      totalCostUsd: number;
    };
    baseline?:
      | {
          agreementRate: number;
          calibrationAccuracy: number;
          avgScoreDifference: number;
          falsePositiveRate: number;
          falseNegativeRate: number;
          avgLatencyMs: number;
          totalCostUsd: number;
        }
      | undefined;
  }): BenchmarkRegression[] {
    const { runId, current, baseline } = params;
    const regressions: BenchmarkRegression[] = [];

    const check = (
      type: string,
      currentVal: number,
      baselineVal: number | undefined,
      threshold: number,
      lowerIsBetter: boolean
    ): void => {
      const thresholdViolated = lowerIsBetter ? currentVal > threshold : currentVal < threshold;
      const baselineDegrades =
        baseline !== undefined && lowerIsBetter
          ? currentVal > baselineVal! + this.config.maxAgreementDegradation
          : baseline !== undefined
            ? currentVal < baselineVal! - this.config.maxAgreementDegradation
            : false;

      if (!thresholdViolated && !baselineDegrades) return;

      const delta = baselineVal !== undefined ? currentVal - baselineVal : 0;
      const deltaPercent =
        baselineVal && baselineVal !== 0 ? Math.abs((delta / baselineVal) * 100) : 0;

      const severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
        deltaPercent > 20
          ? 'CRITICAL'
          : deltaPercent > 10
            ? 'HIGH'
            : deltaPercent > 5
              ? 'MEDIUM'
              : 'LOW';

      regressions.push(
        new BenchmarkRegression({
          id: randomUUID(),
          runId,
          baselineRunId: baseline !== undefined ? undefined : undefined,
          regressionType: type,
          severity,
          currentValue: currentVal,
          baselineValue: baselineVal,
          thresholdValue: threshold,
          delta,
          deltaPercent,
          description: `${type}: current=${currentVal.toFixed(4)}, baseline=${baselineVal?.toFixed(4) ?? 'N/A'}, threshold=${threshold}`,
        })
      );
    };

    check(
      'AGREEMENT_DEGRADATION',
      current.agreementRate,
      baseline?.agreementRate,
      this.config.agreementRateThreshold,
      false
    );
    check(
      'CALIBRATION_DRIFT',
      current.calibrationAccuracy,
      baseline?.calibrationAccuracy,
      this.config.calibrationAccuracyThreshold,
      false
    );
    check(
      'SCORE_DRIFT',
      current.avgScoreDifference,
      baseline?.avgScoreDifference,
      this.config.maxScoreDrift,
      true
    );
    check(
      'FALSE_POSITIVE_INCREASE',
      current.falsePositiveRate,
      baseline?.falsePositiveRate,
      this.config.maxFalsePositiveRate,
      true
    );
    check(
      'FALSE_NEGATIVE_INCREASE',
      current.falseNegativeRate,
      baseline?.falseNegativeRate,
      this.config.maxFalseNegativeRate,
      true
    );

    return regressions;
  }
}

export interface DeploymentDecisionConfig {
  minAgreementRate: number; // default 0.80
  minCalibrationAccuracy: number; // default 0.75
  maxAllowedRegressions: number; // default 2
  maxCriticalRegressions: number; // default 0
}

export const DEFAULT_DEPLOYMENT_CONFIG: DeploymentDecisionConfig = {
  minAgreementRate: 0.8,
  minCalibrationAccuracy: 0.75,
  maxAllowedRegressions: 2,
  maxCriticalRegressions: 0,
};

export class DeploymentDecisionEngine {
  constructor(private readonly config: DeploymentDecisionConfig = DEFAULT_DEPLOYMENT_CONFIG) {}

  /**
   * Determines a deployment verdict based on measured metrics and detected regressions.
   */
  public decide(params: {
    tenantId: string;
    runId: string;
    experimentId?: string | undefined;
    agreementRate: number;
    calibrationAccuracy: number;
    regressions: BenchmarkRegression[];
  }): DeploymentDecision {
    const { tenantId, runId, experimentId, agreementRate, calibrationAccuracy, regressions } =
      params;
    const criticalRegressions = regressions.filter((r) => r.severity === 'CRITICAL').length;
    const reasons: string[] = [];
    let verdict: DeploymentVerdict = 'APPROVED';

    if (agreementRate < this.config.minAgreementRate) {
      reasons.push(
        `Agreement rate ${(agreementRate * 100).toFixed(1)}% below threshold ${(this.config.minAgreementRate * 100).toFixed(1)}%`
      );
      verdict = 'REJECTED';
    }

    if (calibrationAccuracy < this.config.minCalibrationAccuracy) {
      reasons.push(
        `Calibration accuracy ${(calibrationAccuracy * 100).toFixed(1)}% below threshold`
      );
      verdict = 'REJECTED';
    }

    if (criticalRegressions > this.config.maxCriticalRegressions) {
      reasons.push(`${criticalRegressions} critical regression(s) detected`);
      verdict = 'REJECTED';
    } else if (regressions.length > this.config.maxAllowedRegressions) {
      reasons.push(
        `${regressions.length} regression(s) exceed allowed maximum of ${this.config.maxAllowedRegressions}`
      );
      if (verdict === 'APPROVED') verdict = 'NEEDS_REVIEW';
    }

    if (verdict === 'APPROVED' && reasons.length === 0) {
      reasons.push('All quality thresholds met. No regressions detected.');
    }

    this.addDomainEvent_internal(
      new DeploymentDecisionMade(runId, { verdict, regressionCount: regressions.length })
    );

    return new DeploymentDecision({
      id: randomUUID(),
      tenantId,
      runId,
      experimentId,
      verdict,
      agreementRate,
      calibrationAccuracy,
      regressionCount: regressions.length,
      criticalRegressions,
      decisionReason: reasons.join('; '),
      thresholdsApplied: {
        minAgreementRate: this.config.minAgreementRate,
        minCalibrationAccuracy: this.config.minCalibrationAccuracy,
        maxAllowedRegressions: this.config.maxAllowedRegressions,
        maxCriticalRegressions: this.config.maxCriticalRegressions,
      },
    });
  }

  private addDomainEvent_internal(_event: DomainEvent): void {
    // Domain events published via integration layer
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 6: CONTINUOUS VALIDATION PIPELINE
// ───────────────────────────────────────────────────────────────────

export interface PipelineStep {
  name: string;
  execute(): Promise<void>;
}

export interface ValidationPipelineResult {
  experimentId: string;
  runId: string;
  verdict: DeploymentVerdict;
  agreementRate: number;
  regressionCount: number;
  decision: DeploymentDecision;
}

/**
 * ContinuousValidationPipeline orchestrates the full quality gate:
 * Prompt Change → Benchmark Trigger → Evaluation Pipeline →
 * Human Comparison → Agreement Analysis → Regression Detection → Deployment Decision
 */
export class ContinuousValidationPipeline {
  constructor(
    private readonly benchmarkEngine: BenchmarkEngine,
    private readonly regressionEngine: RegressionDetectionEngine,
    private readonly decisionEngine: DeploymentDecisionEngine
  ) {}

  public async run(params: {
    experiment: PromptExperiment;
    run: BenchmarkRun;
    dataset: BenchmarkDataset;
    buildPrompt: (item: BenchmarkDatasetItem) => EvaluationPrompt;
    parseScore: (response: string) => { score: number; confidence: number };
    baselineMetrics?: {
      agreementRate: number;
      calibrationAccuracy: number;
      avgScoreDifference: number;
      falsePositiveRate: number;
      falseNegativeRate: number;
      avgLatencyMs: number;
      totalCostUsd: number;
    };
  }): Promise<ValidationPipelineResult> {
    const { experiment, run, dataset, buildPrompt, parseScore, baselineMetrics } = params;

    // Step 1: Start experiment
    experiment.start();

    // Step 2: Execute benchmark (Evaluation Pipeline + Human Comparison)
    const summary = await this.benchmarkEngine.execute({ run, dataset, buildPrompt, parseScore });

    // Step 3: Agreement Analysis (already done inside BenchmarkEngine)
    const { agreementRate, calibrationAccuracy } = summary;

    // Step 4: Regression Detection
    const regressions = this.regressionEngine.detect({
      runId: run.id,
      current: {
        agreementRate: agreementRate.rate,
        calibrationAccuracy: calibrationAccuracy.value,
        avgScoreDifference: summary.avgScoreDifference,
        falsePositiveRate: summary.falsePositiveRate,
        falseNegativeRate: summary.falseNegativeRate,
        avgLatencyMs: summary.averageLatency.avgMs,
        totalCostUsd: summary.evaluationCost.totalUsd,
      },
      baseline: baselineMetrics,
    });

    regressions.forEach((r) => run.addRegression(r));

    // Step 5: Build a PromptPerformanceMetric for experiment completion
    const metrics = new PromptPerformanceMetric({
      id: randomUUID(),
      experimentId: experiment.id,
      promptVersionId: run.promptVersionId ?? experiment.candidateVersionId,
      sampleCount: summary.processedItems,
      agreementRate,
      calibrationAccuracy,
      avgScoreDifference: summary.avgScoreDifference,
      falsePositiveRate: summary.falsePositiveRate,
      falseNegativeRate: summary.falseNegativeRate,
      averageLatency: summary.averageLatency,
      evaluationCost: summary.evaluationCost,
    });

    experiment.complete(metrics);

    // Step 6: Deployment Decision
    const decision = this.decisionEngine.decide({
      tenantId: experiment.tenantId,
      runId: run.id,
      experimentId: experiment.id,
      agreementRate: agreementRate.rate,
      calibrationAccuracy: calibrationAccuracy.value,
      regressions,
    });

    return {
      experimentId: experiment.id,
      runId: run.id,
      verdict: decision.verdict,
      agreementRate: agreementRate.rate,
      regressionCount: regressions.length,
      decision,
    };
  }
}
