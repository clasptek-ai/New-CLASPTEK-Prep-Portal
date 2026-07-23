import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';
import type { PromptHash } from '../index';

// ═══════════════════════════════════════════════════════════════════
// PROMPT VERSION — First-class aggregate for version auditing & A/B
// ═══════════════════════════════════════════════════════════════════

export type PromptVersionStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED';

/**
 * Elevates the existing PromptVersion entity to a first-class aggregate
 * for auditing, A/B testing, and governance integration. Captures all
 * LLM parameters needed for reproducible execution.
 */
export class PromptVersionAggregate extends AggregateRoot<string> {
  public readonly templateId: string;
  public readonly version: string;
  public readonly provider: string;
  public readonly schemaVersion: string;
  public readonly systemPrompt: string;
  public readonly userPromptTemplate: string;
  public readonly temperature: number;
  public readonly topP: number;
  public readonly maxTokens: number;
  private _status: PromptVersionStatus;
  public readonly promptHash: PromptHash;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    templateId: string;
    version: string;
    provider: string;
    schemaVersion: string;
    systemPrompt: string;
    userPromptTemplate: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    status?: PromptVersionStatus;
    promptHash: PromptHash;
    createdAt?: Date;
  }) {
    super(props.id);
    if (!props.templateId) throw new Error('PromptVersionAggregate templateId cannot be empty');
    if (!props.version) throw new Error('PromptVersionAggregate version cannot be empty');
    if (!props.provider) throw new Error('PromptVersionAggregate provider cannot be empty');

    this.templateId = props.templateId;
    this.version = props.version;
    this.provider = props.provider;
    this.schemaVersion = props.schemaVersion;
    this.systemPrompt = props.systemPrompt;
    this.userPromptTemplate = props.userPromptTemplate;
    this.temperature = props.temperature;
    this.topP = props.topP;
    this.maxTokens = props.maxTokens;
    this._status = props.status ?? 'DRAFT';
    this.promptHash = props.promptHash;
    this.createdAt = props.createdAt ?? new Date();
  }

  get status(): PromptVersionStatus {
    return this._status;
  }
  get isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public activate(): void {
    if (this._status === 'DEPRECATED') {
      throw new Error('Cannot activate a deprecated PromptVersion');
    }
    this._status = 'ACTIVE';
  }

  public deprecate(): void {
    this._status = 'DEPRECATED';
  }

  public static create(props: {
    templateId: string;
    version: string;
    provider: string;
    schemaVersion: string;
    systemPrompt: string;
    userPromptTemplate: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    promptHash: PromptHash;
  }): PromptVersionAggregate {
    return new PromptVersionAggregate({
      id: randomUUID(),
      temperature: props.temperature ?? 0.3,
      topP: props.topP ?? 0.95,
      maxTokens: props.maxTokens ?? 4096,
      ...props,
    });
  }
}
