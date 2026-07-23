import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// AI EVALUATION STANDARD — Versioned output quality contract
// ═══════════════════════════════════════════════════════════════════

export type EvaluationStandardStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED';

/**
 * Versioned evaluation standard governing AI output quality.
 * Every prompt references a standard version so that output schema,
 * scoring rules, and safety constraints are consistent and auditable.
 */
export class AIEvaluationStandard extends AggregateRoot<string> {
  public readonly version: string;
  public readonly displayName: string;
  public readonly outputSchema: Record<string, any>;
  public readonly jsonRules: string[];
  public readonly scoringRules: string[];
  public readonly fallbackRules: string[];
  public readonly retryRules: string[];
  public readonly safetyRules: string[];
  private _status: EvaluationStandardStatus;
  public readonly effectiveDate: Date;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    version: string;
    displayName: string;
    outputSchema: Record<string, any>;
    jsonRules?: string[];
    scoringRules?: string[];
    fallbackRules?: string[];
    retryRules?: string[];
    safetyRules?: string[];
    status?: EvaluationStandardStatus;
    effectiveDate?: Date;
    createdAt?: Date;
  }) {
    super(props.id);
    if (!props.version) throw new Error('AIEvaluationStandard version cannot be empty');
    if (!props.displayName) throw new Error('AIEvaluationStandard displayName cannot be empty');

    this.version = props.version;
    this.displayName = props.displayName;
    this.outputSchema = Object.freeze({ ...props.outputSchema });
    this.jsonRules = [...(props.jsonRules ?? [])];
    this.scoringRules = [...(props.scoringRules ?? [])];
    this.fallbackRules = [...(props.fallbackRules ?? [])];
    this.retryRules = [...(props.retryRules ?? [])];
    this.safetyRules = [...(props.safetyRules ?? [])];
    this._status = props.status ?? 'DRAFT';
    this.effectiveDate = props.effectiveDate ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
  }

  get status(): EvaluationStandardStatus {
    return this._status;
  }
  get isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public activate(): void {
    if (this._status === 'DEPRECATED') {
      throw new Error('Cannot activate a deprecated AIEvaluationStandard');
    }
    this._status = 'ACTIVE';
  }

  public deprecate(): void {
    this._status = 'DEPRECATED';
  }

  /** Compile all rules into a single instruction block for prompt injection. */
  public compileRules(): string {
    const sections: string[] = [];

    if (this.jsonRules.length > 0) {
      sections.push('## JSON Output Rules\n' + this.jsonRules.map((r) => `- ${r}`).join('\n'));
    }
    if (this.scoringRules.length > 0) {
      sections.push('## Scoring Rules\n' + this.scoringRules.map((r) => `- ${r}`).join('\n'));
    }
    if (this.fallbackRules.length > 0) {
      sections.push('## Fallback Rules\n' + this.fallbackRules.map((r) => `- ${r}`).join('\n'));
    }
    if (this.safetyRules.length > 0) {
      sections.push('## Safety Rules\n' + this.safetyRules.map((r) => `- ${r}`).join('\n'));
    }

    return sections.join('\n\n');
  }

  public static create(props: {
    version: string;
    displayName: string;
    outputSchema: Record<string, any>;
    jsonRules?: string[];
    scoringRules?: string[];
    fallbackRules?: string[];
    retryRules?: string[];
    safetyRules?: string[];
  }): AIEvaluationStandard {
    return new AIEvaluationStandard({ id: randomUUID(), ...props });
  }
}
