import { AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// MULTI-VARIANT PROMPT EXPERIMENT — Multi-variant A/B/C/D testing
// ═══════════════════════════════════════════════════════════════════

export interface ExperimentVariantProps {
  variantId: string;
  promptVersionId: string;
  label: string; // e.g. "Variant A - Core Prompt"
}

export class ExperimentVariant extends ValueObject<ExperimentVariantProps> {
  constructor(props: ExperimentVariantProps) {
    if (!props.variantId) throw new Error('ExperimentVariant variantId cannot be empty');
    if (!props.promptVersionId)
      throw new Error('ExperimentVariant promptVersionId cannot be empty');
    if (!props.label) throw new Error('ExperimentVariant label cannot be empty');
    super(props);
  }

  get variantId(): string {
    return this.props.variantId;
  }
  get promptVersionId(): string {
    return this.props.promptVersionId;
  }
  get label(): string {
    return this.props.label;
  }
}

export interface VariantMetricsProps {
  variantId: string;
  averageDeviation: number; // Accuracy against golden dataset
  rootMeanSquaredError: number;
  scoringVariance: number; // Consistency
  averageLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
}

export class VariantMetrics extends ValueObject<VariantMetricsProps> {
  constructor(props: VariantMetricsProps) {
    super(props);
  }

  get variantId(): string {
    return this.props.variantId;
  }
  get averageDeviation(): number {
    return this.props.averageDeviation;
  }
  get rootMeanSquaredError(): number {
    return this.props.rootMeanSquaredError;
  }
  get scoringVariance(): number {
    return this.props.scoringVariance;
  }
  get averageLatencyMs(): number {
    return this.props.averageLatencyMs;
  }
  get totalTokens(): number {
    return this.props.totalTokens;
  }
  get totalCostUsd(): number {
    return this.props.totalCostUsd;
  }
}

export type MultiVariantPromptExperimentStatus = 'PLANNED' | 'RUNNING' | 'COMPLETED';

export class MultiVariantPromptExperiment extends AggregateRoot<string> {
  public readonly experimentCode: string;
  public readonly assessmentType: string;
  public readonly skillCode: string;
  public readonly datasetId: string;
  private _status: MultiVariantPromptExperimentStatus;
  private _variants: ExperimentVariant[];
  private _results: VariantMetrics[];
  private _winnerVariantId: string | undefined;
  public readonly startedAt: Date;
  private _completedAt: Date | undefined;

  constructor(props: {
    id: string;
    experimentCode: string;
    assessmentType: string;
    skillCode: string;
    datasetId: string;
    status?: MultiVariantPromptExperimentStatus;
    variants?: ExperimentVariant[];
    results?: VariantMetrics[];
    winnerVariantId?: string;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    super(props.id);
    if (!props.experimentCode)
      throw new Error('MultiVariantPromptExperiment experimentCode cannot be empty');
    if (!props.assessmentType)
      throw new Error('MultiVariantPromptExperiment assessmentType cannot be empty');
    if (!props.skillCode) throw new Error('MultiVariantPromptExperiment skillCode cannot be empty');
    if (!props.datasetId) throw new Error('MultiVariantPromptExperiment datasetId cannot be empty');

    this.experimentCode = props.experimentCode;
    this.assessmentType = props.assessmentType;
    this.skillCode = props.skillCode;
    this.datasetId = props.datasetId;
    this._status = props.status ?? 'PLANNED';
    this._variants = [...(props.variants ?? [])];
    this._results = [...(props.results ?? [])];
    this._winnerVariantId = props.winnerVariantId;
    this.startedAt = props.startedAt ?? new Date();
    this._completedAt = props.completedAt;
  }

  get status(): MultiVariantPromptExperimentStatus {
    return this._status;
  }
  get variants(): readonly ExperimentVariant[] {
    return this._variants;
  }
  get results(): readonly VariantMetrics[] {
    return this._results;
  }
  get winnerVariantId(): string | undefined {
    return this._winnerVariantId;
  }
  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public addVariant(variant: ExperimentVariant): void {
    if (this._status !== 'PLANNED') {
      throw new Error(`Cannot add variants in status '${this._status}'`);
    }
    if (this._variants.some((v) => v.variantId === variant.variantId)) {
      throw new Error(`Variant with ID '${variant.variantId}' already exists in this experiment`);
    }
    this._variants.push(variant);
  }

  public start(): void {
    if (this._status !== 'PLANNED') {
      throw new Error(`Cannot start experiment in status '${this._status}'`);
    }
    if (this._variants.length < 2) {
      throw new Error('Cannot start experiment with fewer than 2 variants');
    }
    this._status = 'RUNNING';
  }

  public recordResult(metrics: VariantMetrics): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot record metrics in status '${this._status}'`);
    }
    const index = this._results.findIndex((r) => r.variantId === metrics.variantId);
    if (index >= 0) {
      this._results[index] = metrics;
    } else {
      this._results.push(metrics);
    }
  }

  public complete(winnerVariantId: string, at: Date = new Date()): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot complete experiment in status '${this._status}'`);
    }
    if (!this._variants.some((v) => v.variantId === winnerVariantId)) {
      throw new Error(`Winner variant '${winnerVariantId}' is not part of this experiment`);
    }
    if (this._results.length !== this._variants.length) {
      throw new Error('Cannot complete experiment before recording results for all variants');
    }

    this._status = 'COMPLETED';
    this._winnerVariantId = winnerVariantId;
    this._completedAt = at;
  }

  public static create(props: {
    experimentCode: string;
    assessmentType: string;
    skillCode: string;
    datasetId: string;
  }): MultiVariantPromptExperiment {
    return new MultiVariantPromptExperiment({
      id: randomUUID(),
      ...props,
    });
  }
}
