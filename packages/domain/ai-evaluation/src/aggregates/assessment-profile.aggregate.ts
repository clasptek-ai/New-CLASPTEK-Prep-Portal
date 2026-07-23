import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';
import { AssessmentType } from '../value-objects/AssessmentType';

// ═══════════════════════════════════════════════════════════════════
// ASSESSMENT PROFILE — Central binding aggregate for evaluation config
// ═══════════════════════════════════════════════════════════════════

export type AssessmentProfileStatus = 'ACTIVE' | 'DISABLED' | 'ARCHIVED';

export class AssessmentProfile extends AggregateRoot<string> {
  public readonly assessmentType: AssessmentType;
  public readonly skillCode: string;
  public readonly promptTemplateCode: string;
  public readonly promptVersionId: string | undefined;
  public readonly rubricCode: string;
  public readonly evaluationStandardId: string;
  public readonly provider: string;
  public readonly temperature: number;
  public readonly topP: number;
  public readonly maxTokens: number;
  public readonly confidenceThreshold: number;
  public readonly passingCriteria: Record<string, any>;
  private _status: AssessmentProfileStatus;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    assessmentType: AssessmentType;
    skillCode: string;
    promptTemplateCode: string;
    promptVersionId?: string;
    rubricCode: string;
    evaluationStandardId: string;
    provider: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    confidenceThreshold: number;
    passingCriteria?: Record<string, any>;
    status?: AssessmentProfileStatus;
    createdAt?: Date;
  }) {
    super(props.id);

    // Validate skill is supported by the assessment type
    if (!props.assessmentType.supportsSkill(props.skillCode)) {
      throw new Error(
        `Assessment '${props.assessmentType.code}' does not support skill '${props.skillCode}'. ` +
          `Supported skills: ${props.assessmentType.supportedSkills.join(', ')}`
      );
    }

    // Validate provider is supported
    if (!props.assessmentType.supportsProvider(props.provider)) {
      throw new Error(
        `Assessment '${props.assessmentType.code}' does not support provider '${props.provider}'`
      );
    }

    // Validate confidence threshold
    if (props.confidenceThreshold < 0 || props.confidenceThreshold > 1) {
      throw new Error('AssessmentProfile confidenceThreshold must be between 0.0 and 1.0');
    }

    // Validate temperature
    if (props.temperature < 0 || props.temperature > 2) {
      throw new Error('AssessmentProfile temperature must be between 0.0 and 2.0');
    }

    // Validate topP
    if (props.topP < 0 || props.topP > 1) {
      throw new Error('AssessmentProfile topP must be between 0.0 and 1.0');
    }

    this.assessmentType = props.assessmentType;
    this.skillCode = props.skillCode;
    this.promptTemplateCode = props.promptTemplateCode;
    this.promptVersionId = props.promptVersionId;
    this.rubricCode = props.rubricCode;
    this.evaluationStandardId = props.evaluationStandardId;
    this.provider = props.provider;
    this.temperature = props.temperature;
    this.topP = props.topP;
    this.maxTokens = props.maxTokens;
    this.confidenceThreshold = props.confidenceThreshold;
    this.passingCriteria = Object.freeze({ ...(props.passingCriteria ?? {}) });
    this._status = props.status ?? 'ACTIVE';
    this.createdAt = props.createdAt ?? new Date();
  }

  get status(): AssessmentProfileStatus {
    return this._status;
  }
  get isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public activate(): void {
    if (this._status === 'ARCHIVED') {
      throw new Error('Cannot activate an archived AssessmentProfile');
    }
    this._status = 'ACTIVE';
  }

  public disable(): void {
    this._status = 'DISABLED';
  }

  public archive(): void {
    this._status = 'ARCHIVED';
  }

  /** Check whether a confidence score meets the auto-approval threshold. */
  public meetsConfidenceThreshold(confidence: number): boolean {
    return confidence >= this.confidenceThreshold;
  }

  public static create(props: {
    assessmentType: AssessmentType;
    skillCode: string;
    promptTemplateCode: string;
    promptVersionId?: string;
    rubricCode: string;
    evaluationStandardId: string;
    provider: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    confidenceThreshold?: number;
    passingCriteria?: Record<string, any>;
  }): AssessmentProfile {
    return new AssessmentProfile({
      id: randomUUID(),
      temperature: props.temperature ?? 0.3,
      topP: props.topP ?? 0.95,
      maxTokens: props.maxTokens ?? 4096,
      confidenceThreshold: props.confidenceThreshold ?? 0.85,
      ...props,
    });
  }
}
