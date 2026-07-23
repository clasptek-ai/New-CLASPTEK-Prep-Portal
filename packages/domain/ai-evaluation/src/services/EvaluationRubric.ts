// ═══════════════════════════════════════════════════════════════════
// EVALUATION RUBRIC — Assessment-agnostic rubric interface
// ═══════════════════════════════════════════════════════════════════

/**
 * Abstract rubric interface enabling exam-type extensibility.
 * Every assessment family implements this contract with its own
 * criteria definitions, band descriptors, and evaluation instructions.
 *
 * Concrete implementations (Sprint 3.9+):
 * - IELTSWritingTask1Rubric
 * - IELTSWritingTask2Rubric
 * - IELTSSpeakingRubric
 * - TOEFLWritingRubric, TOEFLSpeakingRubric
 * - CELPIPWritingRubric, CELPIPSpeakingRubric
 * - SATReadingRubric, SATWritingRubric
 * - EnglishProficiencyWritingRubric, EnglishProficiencyGrammarRubric
 */
export interface EvaluationRubric {
  /** Unique rubric identifier code (e.g. 'ielts-writing-task2-v1'). */
  readonly rubricCode: string;

  /** Assessment family code (e.g. 'IELTS', 'TOEFL'). */
  readonly assessmentType: string;

  /** Target skill code (e.g. 'WRITING_TASK_2', 'SPEAKING_PART_1'). */
  readonly skillCode: string;

  /** All criteria defined by this rubric. */
  readonly criteria: RubricCriterionDescriptor[];

  /**
   * Generate human-readable evaluation instructions for an AI provider.
   * These instructions describe how to apply the rubric's criteria.
   */
  generateEvaluationInstructions(): string;

  /**
   * Get the official band/score descriptor for a specific criterion at a given level.
   * Returns the descriptor text (e.g. IELTS Band 7 Task Response descriptor).
   */
  getCriterionDescriptor(criterionCode: string, band: number): string;

  /**
   * Get all criteria codes defined by this rubric.
   */
  getCriteriaCodes(): string[];

  /**
   * Validate that an AI response contains all expected criterion scores.
   */
  validateResponse(response: Record<string, any>): RubricValidationResult;
}

// ─── Supporting Types ────────────────────────────────────────────

/**
 * Describes a single rubric criterion with its band descriptors.
 * The band descriptors map score levels to official descriptor text.
 */
export interface RubricCriterionDescriptor {
  /** Criterion code (e.g. 'TASK_RESPONSE', 'COHERENCE'). */
  code: string;

  /** Human-readable criterion name (e.g. 'Task Response'). */
  name: string;

  /** Weight within the overall score (0.0–1.0, all weights should sum to 1.0). */
  weight: number;

  /**
   * Band-level descriptors mapping score → official descriptor text.
   * For IELTS: Map { 4 → "Responds to the task only in...", 5 → "Addresses the task...", ... }
   */
  bandDescriptors: Map<number, string>;
}

/**
 * The result of evaluating a single criterion.
 * Produced by the AI provider and validated against the rubric.
 */
export interface CriterionEvaluation {
  /** Criterion code matching a RubricCriterionDescriptor. */
  criterionCode: string;

  /** Awarded band/score for this criterion. */
  band: number;

  /** AI's rationale for the awarded band. */
  rationale: string;

  /** Specific strengths identified by the AI. */
  strengths: string[];

  /** Specific weaknesses identified by the AI. */
  weaknesses: string[];

  /** Actionable improvement suggestions. */
  improvementPlan: string[];
}

/**
 * Validation result from checking an AI response against rubric expectations.
 */
export interface RubricValidationResult {
  isValid: boolean;
  missingCriteria: string[];
  unexpectedCriteria: string[];
  errors: string[];
}

// ─── Abstract Base Rubric ────────────────────────────────────────

/**
 * Base implementation providing common rubric logic.
 * Assessment-specific rubrics extend this class and populate criteria/descriptors.
 */
export abstract class BaseEvaluationRubric implements EvaluationRubric {
  abstract readonly rubricCode: string;
  abstract readonly assessmentType: string;
  abstract readonly skillCode: string;
  abstract readonly criteria: RubricCriterionDescriptor[];

  public getCriteriaCodes(): string[] {
    return this.criteria.map((c) => c.code);
  }

  public getCriterionDescriptor(criterionCode: string, band: number): string {
    const criterion = this.criteria.find((c) => c.code === criterionCode);
    if (!criterion) {
      throw new Error(`Criterion '${criterionCode}' not found in rubric '${this.rubricCode}'`);
    }
    const descriptor = criterion.bandDescriptors.get(band);
    if (!descriptor) {
      // Fall back to nearest lower band
      const availableBands = Array.from(criterion.bandDescriptors.keys()).sort((a, b) => b - a);
      const nearestLower = availableBands.find((b) => b <= band);
      if (nearestLower !== undefined) {
        return criterion.bandDescriptors.get(nearestLower)!;
      }
      throw new Error(`No descriptor found for criterion '${criterionCode}' at band ${band}`);
    }
    return descriptor;
  }

  public generateEvaluationInstructions(): string {
    const criteriaInstructions = this.criteria
      .map((c) => {
        const descriptorEntries = Array.from(c.bandDescriptors.entries())
          .sort(([a], [b]) => a - b)
          .map(([band, desc]) => `  Band ${band}: ${desc}`)
          .join('\n');

        return `### ${c.name} (${c.code}) — Weight: ${(c.weight * 100).toFixed(0)}%\n${descriptorEntries}`;
      })
      .join('\n\n');

    return [
      `# Evaluation Rubric: ${this.rubricCode}`,
      `Assessment: ${this.assessmentType} | Skill: ${this.skillCode}`,
      '',
      'Evaluate the submission using the following criteria:',
      '',
      criteriaInstructions,
    ].join('\n');
  }

  public validateResponse(response: Record<string, any>): RubricValidationResult {
    const expectedCodes = new Set(this.getCriteriaCodes());
    const providedCodes = new Set(Object.keys(response));

    const missingCriteria = [...expectedCodes].filter((c) => !providedCodes.has(c));
    const unexpectedCriteria = [...providedCodes].filter((c) => !expectedCodes.has(c));
    const errors: string[] = [];

    if (missingCriteria.length > 0) {
      errors.push(`Missing criteria: ${missingCriteria.join(', ')}`);
    }
    if (unexpectedCriteria.length > 0) {
      errors.push(`Unexpected criteria: ${unexpectedCriteria.join(', ')}`);
    }

    return {
      isValid: missingCriteria.length === 0,
      missingCriteria,
      unexpectedCriteria,
      errors,
    };
  }
}
