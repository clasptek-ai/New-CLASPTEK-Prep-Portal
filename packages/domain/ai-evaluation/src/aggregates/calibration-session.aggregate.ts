import { AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// CALIBRATION SESSION — Calibration event and results aggregate
// ═══════════════════════════════════════════════════════════════════

export interface CalibrationItemResultProps {
  itemId: string; // Reference to GoldenDatasetItem
  expectedScore: number; // Official benchmark score
  observedScore: number; // AI evaluation score
  error: number; // observed - expected
  criteriaExpected: Record<string, number>;
  criteriaObserved: Record<string, number>;
  confidence: number; // AI confidence score for this item
  latencyMs: number;
}

export class CalibrationItemResult extends ValueObject<CalibrationItemResultProps> {
  constructor(props: CalibrationItemResultProps) {
    super(props);
  }

  get itemId(): string {
    return this.props.itemId;
  }
  get expectedScore(): number {
    return this.props.expectedScore;
  }
  get observedScore(): number {
    return this.props.observedScore;
  }
  get error(): number {
    return this.props.error;
  }
  get criteriaExpected(): Record<string, number> {
    return this.props.criteriaExpected;
  }
  get criteriaObserved(): Record<string, number> {
    return this.props.criteriaObserved;
  }
  get confidence(): number {
    return this.props.confidence;
  }
  get latencyMs(): number {
    return this.props.latencyMs;
  }
}

export interface CalibrationSummaryProps {
  averageDeviation: number; // Mean Absolute Error (MAE)
  maxDeviation: number;
  rootMeanSquaredError: number; // RMSE
  criterionDeviations: Record<string, number>; // criterionCode -> MAE
  averageConfidence: number;
  averageLatencyMs: number;
  totalTokensUsed: number;
  costUsd: number;
  compliancePassed: boolean;
}

export class CalibrationSummary extends ValueObject<CalibrationSummaryProps> {
  constructor(props: CalibrationSummaryProps) {
    super(props);
  }

  get averageDeviation(): number {
    return this.props.averageDeviation;
  }
  get maxDeviation(): number {
    return this.props.maxDeviation;
  }
  get rootMeanSquaredError(): number {
    return this.props.rootMeanSquaredError;
  }
  get criterionDeviations(): Record<string, number> {
    return this.props.criterionDeviations;
  }
  get averageConfidence(): number {
    return this.props.averageConfidence;
  }
  get averageLatencyMs(): number {
    return this.props.averageLatencyMs;
  }
  get totalTokensUsed(): number {
    return this.props.totalTokensUsed;
  }
  get costUsd(): number {
    return this.props.costUsd;
  }
  get compliancePassed(): boolean {
    return this.props.compliancePassed;
  }
}

export type CalibrationSessionStatus = 'PLANNED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export class CalibrationSession extends AggregateRoot<string> {
  public readonly datasetId: string;
  public readonly assessmentProfileId: string;
  public readonly promptVersionId: string | undefined;
  public readonly provider: string;
  public readonly model: string;
  private _status: CalibrationSessionStatus;
  private _results: CalibrationItemResult[];
  private _summary: CalibrationSummary | undefined;
  private _errorMessage: string | undefined;
  public readonly startedAt: Date;
  private _completedAt: Date | undefined;

  constructor(props: {
    id: string;
    datasetId: string;
    assessmentProfileId: string;
    promptVersionId?: string;
    provider: string;
    model: string;
    status?: CalibrationSessionStatus;
    results?: CalibrationItemResult[];
    summary?: CalibrationSummary;
    errorMessage?: string;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    super(props.id);
    if (!props.datasetId) throw new Error('CalibrationSession datasetId cannot be empty');
    if (!props.assessmentProfileId)
      throw new Error('CalibrationSession assessmentProfileId cannot be empty');
    if (!props.provider) throw new Error('CalibrationSession provider cannot be empty');
    if (!props.model) throw new Error('CalibrationSession model cannot be empty');

    this.datasetId = props.datasetId;
    this.assessmentProfileId = props.assessmentProfileId;
    this.promptVersionId = props.promptVersionId;
    this.provider = props.provider;
    this.model = props.model;
    this._status = props.status ?? 'PLANNED';
    this._results = [...(props.results ?? [])];
    this._summary = props.summary;
    this._errorMessage = props.errorMessage;
    this.startedAt = props.startedAt ?? new Date();
    this._completedAt = props.completedAt;
  }

  get status(): CalibrationSessionStatus {
    return this._status;
  }
  get results(): readonly CalibrationItemResult[] {
    return this._results;
  }
  get summary(): CalibrationSummary | undefined {
    return this._summary;
  }
  get errorMessage(): string | undefined {
    return this._errorMessage;
  }
  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public start(): void {
    if (this._status !== 'PLANNED') {
      throw new Error(`Cannot start CalibrationSession in status '${this._status}'`);
    }
    this._status = 'RUNNING';
  }

  public addResult(result: CalibrationItemResult): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot add results to CalibrationSession in status '${this._status}'`);
    }
    this._results.push(result);
  }

  public complete(summary: CalibrationSummary, at: Date = new Date()): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot complete CalibrationSession in status '${this._status}'`);
    }
    this._status = 'COMPLETED';
    this._summary = summary;
    this._completedAt = at;
  }

  public fail(errorMessage: string, at: Date = new Date()): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot fail CalibrationSession in status '${this._status}'`);
    }
    this._status = 'FAILED';
    this._errorMessage = errorMessage;
    this._completedAt = at;
  }

  public static create(props: {
    datasetId: string;
    assessmentProfileId: string;
    promptVersionId?: string;
    provider: string;
    model: string;
  }): CalibrationSession {
    return new CalibrationSession({
      id: randomUUID(),
      ...props,
    });
  }
}
