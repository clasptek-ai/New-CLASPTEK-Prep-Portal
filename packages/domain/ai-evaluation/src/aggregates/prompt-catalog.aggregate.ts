import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// PROMPT CATALOG — Assessment-organized prompt template registry
// ═══════════════════════════════════════════════════════════════════

export interface PromptCatalogEntry {
  templateCode: string;
  assessmentType: string;
  skillCode: string;
  displayName: string;
  releaseStatus: string;
}

/**
 * Top-level registry of all prompt templates, organized by
 * assessment family and skill code. Metadata-only — does not
 * contain prompt text.
 */
export class PromptCatalog extends AggregateRoot<string> {
  public readonly catalogCode: string;
  public readonly displayName: string;
  private _entries: PromptCatalogEntry[];
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    catalogCode: string;
    displayName: string;
    entries?: PromptCatalogEntry[];
    createdAt?: Date;
  }) {
    super(props.id);
    if (!props.catalogCode) throw new Error('PromptCatalog catalogCode cannot be empty');
    if (!props.displayName) throw new Error('PromptCatalog displayName cannot be empty');

    this.catalogCode = props.catalogCode;
    this.displayName = props.displayName;
    this._entries = [...(props.entries ?? [])];
    this.createdAt = props.createdAt ?? new Date();
  }

  get entries(): readonly PromptCatalogEntry[] {
    return this._entries;
  }

  /** Register a new template in the catalog. */
  public register(entry: PromptCatalogEntry): void {
    if (this._entries.some((e) => e.templateCode === entry.templateCode)) {
      throw new Error(
        `Template '${entry.templateCode}' is already registered in catalog '${this.catalogCode}'`
      );
    }
    this._entries.push(entry);
  }

  /** Mark a template as deprecated. */
  public deprecate(templateCode: string): void {
    const entry = this._entries.find((e) => e.templateCode === templateCode);
    if (!entry) {
      throw new Error(`Template '${templateCode}' not found in catalog '${this.catalogCode}'`);
    }
    entry.releaseStatus = 'DEPRECATED';
  }

  /** Find a template by its code. */
  public findByCode(templateCode: string): PromptCatalogEntry | undefined {
    return this._entries.find((e) => e.templateCode === templateCode);
  }

  /** List all active templates for a given assessment type. */
  public listByAssessment(assessmentCode: string): PromptCatalogEntry[] {
    return this._entries.filter(
      (e) => e.assessmentType === assessmentCode && e.releaseStatus === 'ACTIVE'
    );
  }

  /** List all active templates for a given assessment + skill combination. */
  public listByAssessmentAndSkill(assessmentCode: string, skillCode: string): PromptCatalogEntry[] {
    return this._entries.filter(
      (e) =>
        e.assessmentType === assessmentCode &&
        e.skillCode === skillCode &&
        e.releaseStatus === 'ACTIVE'
    );
  }

  /** List all active templates. */
  public listActive(): PromptCatalogEntry[] {
    return this._entries.filter((e) => e.releaseStatus === 'ACTIVE');
  }

  public static create(props: { catalogCode: string; displayName: string }): PromptCatalog {
    return new PromptCatalog({ id: randomUUID(), ...props });
  }
}
