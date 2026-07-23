import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';
import type { PromptVersion } from '../index';

// ═══════════════════════════════════════════════════════════════════
// PROMPT TEMPLATE — Assessment-scoped prompt content aggregate
// ═══════════════════════════════════════════════════════════════════

export type PromptOutputFormat = 'JSON' | 'MARKDOWN' | 'TEXT';
export type PromptReleaseStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

/**
 * Contains the actual prompt content scoped to a specific
 * assessment + skill combination. Manages its version lifecycle
 * through PromptVersion entities.
 */
export class PromptTemplate extends AggregateRoot<string> {
  public readonly templateCode: string;
  public readonly assessmentType: string;
  public readonly skillCode: string;
  public readonly displayName: string;
  public readonly systemPrompt: string;
  public readonly userPromptTemplate: string;
  public readonly placeholders: string[];
  public readonly expectedOutputSchema: Record<string, any>;
  public readonly outputFormat: PromptOutputFormat;
  public readonly providerCompatibility: string[];
  public readonly language: string;
  private _releaseStatus: PromptReleaseStatus;
  public readonly owner: string;
  private _versions: PromptVersion[];
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    templateCode: string;
    assessmentType: string;
    skillCode: string;
    displayName: string;
    systemPrompt: string;
    userPromptTemplate: string;
    placeholders?: string[];
    expectedOutputSchema?: Record<string, any>;
    outputFormat?: PromptOutputFormat;
    providerCompatibility?: string[];
    language?: string;
    releaseStatus?: PromptReleaseStatus;
    owner?: string;
    versions?: PromptVersion[];
    createdAt?: Date;
  }) {
    super(props.id);
    if (!props.templateCode) throw new Error('PromptTemplate templateCode cannot be empty');
    if (!props.assessmentType) throw new Error('PromptTemplate assessmentType cannot be empty');
    if (!props.skillCode) throw new Error('PromptTemplate skillCode cannot be empty');
    if (!props.systemPrompt) throw new Error('PromptTemplate systemPrompt cannot be empty');
    if (!props.userPromptTemplate)
      throw new Error('PromptTemplate userPromptTemplate cannot be empty');

    this.templateCode = props.templateCode;
    this.assessmentType = props.assessmentType;
    this.skillCode = props.skillCode;
    this.displayName = props.displayName;
    this.systemPrompt = props.systemPrompt;
    this.userPromptTemplate = props.userPromptTemplate;
    this.placeholders = [...(props.placeholders ?? [])];
    this.expectedOutputSchema = Object.freeze({ ...(props.expectedOutputSchema ?? {}) });
    this.outputFormat = props.outputFormat ?? 'JSON';
    this.providerCompatibility = [
      ...(props.providerCompatibility ?? ['GEMINI', 'OPENAI', 'ANTHROPIC']),
    ];
    this.language = props.language ?? 'en';
    this._releaseStatus = props.releaseStatus ?? 'DRAFT';
    this.owner = props.owner ?? 'system';
    this._versions = [...(props.versions ?? [])];
    this.createdAt = props.createdAt ?? new Date();
  }

  get releaseStatus(): PromptReleaseStatus {
    return this._releaseStatus;
  }
  get isActive(): boolean {
    return this._releaseStatus === 'ACTIVE';
  }
  get versions(): readonly PromptVersion[] {
    return this._versions;
  }

  /** Returns the current active version (highest version number). */
  get currentVersion(): PromptVersion | undefined {
    return this._versions
      .filter((v) => v.isCurrent)
      .sort((a, b) => b.versionNumber - a.versionNumber)[0];
  }

  public activate(): void {
    if (this._releaseStatus === 'ARCHIVED') {
      throw new Error('Cannot activate an archived PromptTemplate');
    }
    this._releaseStatus = 'ACTIVE';
  }

  public deprecate(): void {
    this._releaseStatus = 'DEPRECATED';
  }

  public archive(): void {
    this._releaseStatus = 'ARCHIVED';
  }

  /** Add a new version to this template. */
  public addVersion(version: PromptVersion): void {
    if (version.templateId !== this.id) {
      throw new Error(
        `PromptVersion templateId '${version.templateId}' does not match template id '${this.id}'`
      );
    }
    this._versions.push(version);
  }

  /** Check if a provider is compatible with this template. */
  public supportsProvider(provider: string): boolean {
    return this.providerCompatibility.includes(provider.toUpperCase());
  }

  /** Validate that all required placeholders are provided. */
  public validateVariables(variables: Record<string, string>): string[] {
    const missing = this.placeholders.filter((p) => !(p in variables));
    return missing;
  }

  public static create(props: {
    templateCode: string;
    assessmentType: string;
    skillCode: string;
    displayName: string;
    systemPrompt: string;
    userPromptTemplate: string;
    placeholders?: string[];
    expectedOutputSchema?: Record<string, any>;
    outputFormat?: PromptOutputFormat;
    providerCompatibility?: string[];
    language?: string;
    owner?: string;
  }): PromptTemplate {
    return new PromptTemplate({ id: randomUUID(), ...props });
  }
}
