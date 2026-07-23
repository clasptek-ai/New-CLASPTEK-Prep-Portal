import { AssessmentType } from '../value-objects/AssessmentType';
import { AssessmentCapability } from '../value-objects/AssessmentType';
import { AssessmentProfile } from '../aggregates/assessment-profile.aggregate';

// ═══════════════════════════════════════════════════════════════════
// ASSESSMENT REGISTRY — Single discovery point for all assessments
// ═══════════════════════════════════════════════════════════════════

/**
 * A registry entry encapsulates all metadata and references for a
 * registered assessment. Downstream components (UI, API validation,
 * workflow routing) query the registry instead of scattered config.
 */
export interface AssessmentRegistryEntry {
  assessmentType: AssessmentType;
  capabilities: AssessmentCapability;
  profiles: AssessmentProfile[];
  rubricCodes: string[];
  promptCatalogCodes: string[];
  datasetPaths: string[];
  activeVersions: Map<string, string>; // skillCode → active prompt version ID
}

/**
 * AssessmentRegistry provides a unified discovery mechanism for all
 * registered assessment families. Instead of distributing assessment
 * configuration across multiple services, the registry centralizes
 * it and enables:
 * - Dynamic UI generation (only show supported skills per assessment)
 * - API request validation (reject unsupported skill requests)
 * - Workflow routing (select the correct pipeline per assessment)
 * - Administrative dashboards (list all assessments with their status)
 */
export class AssessmentRegistry {
  private readonly _entries = new Map<string, AssessmentRegistryEntry>();

  /** Register a new assessment family. */
  public register(entry: AssessmentRegistryEntry): void {
    const code = entry.assessmentType.code;
    if (this._entries.has(code)) {
      throw new Error(`Assessment '${code}' is already registered`);
    }
    this._entries.set(code, entry);
  }

  /** Replace an existing registration (e.g. when profiles change). */
  public update(entry: AssessmentRegistryEntry): void {
    const code = entry.assessmentType.code;
    if (!this._entries.has(code)) {
      throw new Error(`Assessment '${code}' is not registered`);
    }
    this._entries.set(code, entry);
  }

  /** Retrieve a registered assessment by code. */
  public get(assessmentCode: string): AssessmentRegistryEntry | undefined {
    return this._entries.get(assessmentCode);
  }

  /** Retrieve a registered assessment or throw. */
  public getOrFail(assessmentCode: string): AssessmentRegistryEntry {
    const entry = this._entries.get(assessmentCode);
    if (!entry) {
      throw new Error(
        `Assessment '${assessmentCode}' is not registered. ` +
          `Available: ${this.listCodes().join(', ')}`
      );
    }
    return entry;
  }

  /** List all registered assessment codes. */
  public listCodes(): string[] {
    return Array.from(this._entries.keys());
  }

  /** List all registered assessment entries. */
  public listAll(): AssessmentRegistryEntry[] {
    return Array.from(this._entries.values());
  }

  /** Check if an assessment code is registered. */
  public isRegistered(assessmentCode: string): boolean {
    return this._entries.has(assessmentCode);
  }

  /** Find assessments that support a given skill code. */
  public findBySkill(skillCode: string): AssessmentRegistryEntry[] {
    return this.listAll().filter((e) => e.capabilities.supportsSkill(skillCode));
  }

  /** Find assessments that support a given provider. */
  public findByProvider(provider: string): AssessmentRegistryEntry[] {
    return this.listAll().filter((e) => e.assessmentType.supportsProvider(provider));
  }

  /** Get the active AssessmentProfile for a given assessment + skill combination. */
  public resolveProfile(assessmentCode: string, skillCode: string): AssessmentProfile | undefined {
    const entry = this._entries.get(assessmentCode);
    if (!entry) return undefined;
    return entry.profiles.find((p) => p.skillCode === skillCode && p.isActive);
  }

  /** Total number of registered assessments. */
  public get count(): number {
    return this._entries.size;
  }

  /** Remove a registered assessment (for testing or decommissioning). */
  public unregister(assessmentCode: string): boolean {
    return this._entries.delete(assessmentCode);
  }

  /**
   * Validates the configuration completeness of an assessment.
   * Ensures that all required components are configured and present before the assessment is ready for production.
   */
  public validateAssessment(
    assessmentCode: string,
    dependencies: {
      rubrics: { rubricCode: string }[];
      templates: { templateCode: string; versions: { id: string; isCurrent: boolean }[] }[];
      standards: { id: string; isActive: boolean }[];
      datasets: { skillCode: string; itemCount: number }[];
    }
  ): { isValid: boolean; errors: string[] } {
    const entry = this.get(assessmentCode);
    if (!entry) {
      return { isValid: false, errors: [`Assessment '${assessmentCode}' is not registered.`] };
    }

    const errors: string[] = [];

    // 1. Verify AssessmentType & capabilities
    if (!entry.assessmentType) {
      errors.push(`Assessment '${assessmentCode}' is missing AssessmentType.`);
    }

    const supportedSkills = entry.capabilities.supportedSkills();
    if (supportedSkills.length === 0) {
      errors.push(`Assessment '${assessmentCode}' has no supported skills configured.`);
    }

    // 2. Verify AssessmentProfiles exist for supported skills
    for (const skill of supportedSkills) {
      const profile = entry.profiles.find((p) => p.skillCode === skill && p.isActive);
      if (!profile) {
        errors.push(`Missing active AssessmentProfile for skill '${skill}'.`);
        continue;
      }

      // Check standard reference
      const standardExists = dependencies.standards.some(
        (s) => s.id === profile.evaluationStandardId && s.isActive
      );
      if (!standardExists) {
        errors.push(
          `Profile for skill '${skill}' references missing or inactive AIEvaluationStandard '${profile.evaluationStandardId}'.`
        );
      }

      // Check rubric reference
      const rubricExists = dependencies.rubrics.some((r) => r.rubricCode === profile.rubricCode);
      if (!rubricExists) {
        errors.push(
          `Profile for skill '${skill}' references missing EvaluationRubric '${profile.rubricCode}'.`
        );
      }

      // Check prompt template reference
      const template = dependencies.templates.find(
        (t) => t.templateCode === profile.promptTemplateCode
      );
      if (!template) {
        errors.push(
          `Profile for skill '${skill}' references missing PromptTemplate '${profile.promptTemplateCode}'.`
        );
      } else {
        // Verify active prompt version exists for this template
        const activeVersionId = entry.activeVersions.get(skill);
        if (!activeVersionId) {
          errors.push(`Missing active PromptVersion mapping for skill '${skill}'.`);
        } else {
          const versionExists = template.versions.some(
            (v) => v.id === activeVersionId && v.isCurrent
          );
          if (!versionExists) {
            errors.push(
              `Active PromptVersion ID '${activeVersionId}' for skill '${skill}' not found or is not current.`
            );
          }
        }
      }

      // Check GoldenDataset reference
      const dataset = dependencies.datasets.find((d) => d.skillCode === skill);
      if (!dataset || dataset.itemCount === 0) {
        errors.push(`Missing or empty GoldenDataset for skill '${skill}'.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
