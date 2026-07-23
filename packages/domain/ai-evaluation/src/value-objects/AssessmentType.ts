import { ValueObject } from '@clasptek/kernel';

// ═══════════════════════════════════════════════════════════════════
// SCORING SCALE — Assessment-specific scoring configuration
// ═══════════════════════════════════════════════════════════════════

export interface ScoringScaleProps {
  min: number;
  max: number;
  step: number;
  passingScore?: number;
}

export class ScoringScale extends ValueObject<ScoringScaleProps> {
  constructor(props: ScoringScaleProps) {
    if (props.min < 0) throw new Error('ScoringScale min cannot be negative');
    if (props.max <= props.min) throw new Error('ScoringScale max must be greater than min');
    if (props.step <= 0) throw new Error('ScoringScale step must be positive');
    if (
      props.passingScore !== undefined &&
      (props.passingScore < props.min || props.passingScore > props.max)
    ) {
      throw new Error('ScoringScale passingScore must be within [min, max]');
    }
    super(props);
  }

  get min(): number {
    return this.props.min;
  }
  get max(): number {
    return this.props.max;
  }
  get step(): number {
    return this.props.step;
  }
  get passingScore(): number | undefined {
    return this.props.passingScore;
  }

  /** Normalize any raw score to a 0–1 scale for cross-assessment comparison. */
  public normalize(rawScore: number): number {
    if (rawScore < this.props.min || rawScore > this.props.max) {
      throw new Error(`Score ${rawScore} is out of range [${this.props.min}, ${this.props.max}]`);
    }
    return (rawScore - this.props.min) / (this.props.max - this.props.min);
  }

  /** Round a score to the nearest valid step. */
  public roundToStep(score: number): number {
    return Math.round(score / this.props.step) * this.props.step;
  }

  /** Check whether a score meets the passing threshold. */
  public isPassing(score: number): boolean {
    if (this.props.passingScore === undefined) return true;
    return score >= this.props.passingScore;
  }
}

// ═══════════════════════════════════════════════════════════════════
// ASSESSMENT CAPABILITY — What skills an assessment supports
// ═══════════════════════════════════════════════════════════════════

export interface AssessmentCapabilityProps {
  supportsWriting: boolean;
  supportsSpeaking: boolean;
  supportsReading: boolean;
  supportsListening: boolean;
  supportsGrammar: boolean;
  supportsVocabulary: boolean;
}

export class AssessmentCapability extends ValueObject<AssessmentCapabilityProps> {
  constructor(props: AssessmentCapabilityProps) {
    super(props);
  }

  get supportsWriting(): boolean {
    return this.props.supportsWriting;
  }
  get supportsSpeaking(): boolean {
    return this.props.supportsSpeaking;
  }
  get supportsReading(): boolean {
    return this.props.supportsReading;
  }
  get supportsListening(): boolean {
    return this.props.supportsListening;
  }
  get supportsGrammar(): boolean {
    return this.props.supportsGrammar;
  }
  get supportsVocabulary(): boolean {
    return this.props.supportsVocabulary;
  }

  /** Returns an array of supported skill codes. */
  public supportedSkills(): string[] {
    const skills: string[] = [];
    if (this.props.supportsWriting) skills.push('WRITING');
    if (this.props.supportsSpeaking) skills.push('SPEAKING');
    if (this.props.supportsReading) skills.push('READING');
    if (this.props.supportsListening) skills.push('LISTENING');
    if (this.props.supportsGrammar) skills.push('GRAMMAR');
    if (this.props.supportsVocabulary) skills.push('VOCABULARY');
    return skills;
  }

  /** Check whether a specific skill code is supported. */
  public supportsSkill(skillCode: string): boolean {
    return this.supportedSkills().includes(skillCode.toUpperCase());
  }
}

// ═══════════════════════════════════════════════════════════════════
// ASSESSMENT TYPE — First-class value object for assessment families
// ═══════════════════════════════════════════════════════════════════

export interface AssessmentTypeProps {
  code: string;
  displayName: string;
  providerSupport: string[];
  capabilities: AssessmentCapability;
  scoringScale: ScoringScale;
  rubricFamily: string;
}

export class AssessmentType extends ValueObject<AssessmentTypeProps> {
  constructor(props: AssessmentTypeProps) {
    if (!props.code) throw new Error('AssessmentType code cannot be empty');
    if (!props.displayName) throw new Error('AssessmentType displayName cannot be empty');
    if (!props.rubricFamily) throw new Error('AssessmentType rubricFamily cannot be empty');
    if (props.providerSupport.length === 0)
      throw new Error('AssessmentType must support at least one provider');
    super(props);
  }

  get code(): string {
    return this.props.code;
  }
  get displayName(): string {
    return this.props.displayName;
  }
  get providerSupport(): readonly string[] {
    return this.props.providerSupport;
  }
  get capabilities(): AssessmentCapability {
    return this.props.capabilities;
  }
  get scoringScale(): ScoringScale {
    return this.props.scoringScale;
  }
  get rubricFamily(): string {
    return this.props.rubricFamily;
  }
  get supportedSkills(): string[] {
    return this.props.capabilities.supportedSkills();
  }

  /** Check if this assessment supports a given provider. */
  public supportsProvider(provider: string): boolean {
    return this.props.providerSupport.includes(provider.toUpperCase());
  }

  /** Check if this assessment supports a given skill. */
  public supportsSkill(skillCode: string): boolean {
    return this.props.capabilities.supportsSkill(skillCode);
  }
}

// ═══════════════════════════════════════════════════════════════════
// PRE-DEFINED ASSESSMENT TYPES
// ═══════════════════════════════════════════════════════════════════

const ALL_PROVIDERS = ['GEMINI', 'OPENAI', 'ANTHROPIC', 'AZURE', 'MOCK'];

export const IELTS_ASSESSMENT = new AssessmentType({
  code: 'IELTS',
  displayName: 'IELTS Academic',
  providerSupport: ALL_PROVIDERS,
  capabilities: new AssessmentCapability({
    supportsWriting: true,
    supportsSpeaking: true,
    supportsReading: true,
    supportsListening: true,
    supportsGrammar: false,
    supportsVocabulary: false,
  }),
  scoringScale: new ScoringScale({ min: 0, max: 9, step: 0.5, passingScore: 6.5 }),
  rubricFamily: 'IELTS_ACADEMIC',
});

export const TOEFL_ASSESSMENT = new AssessmentType({
  code: 'TOEFL',
  displayName: 'TOEFL iBT',
  providerSupport: ALL_PROVIDERS,
  capabilities: new AssessmentCapability({
    supportsWriting: true,
    supportsSpeaking: true,
    supportsReading: true,
    supportsListening: true,
    supportsGrammar: false,
    supportsVocabulary: false,
  }),
  scoringScale: new ScoringScale({ min: 0, max: 30, step: 1, passingScore: 20 }),
  rubricFamily: 'TOEFL_IBT',
});

export const CELPIP_ASSESSMENT = new AssessmentType({
  code: 'CELPIP',
  displayName: 'CELPIP General',
  providerSupport: ALL_PROVIDERS,
  capabilities: new AssessmentCapability({
    supportsWriting: true,
    supportsSpeaking: true,
    supportsReading: true,
    supportsListening: true,
    supportsGrammar: false,
    supportsVocabulary: false,
  }),
  scoringScale: new ScoringScale({ min: 1, max: 12, step: 1, passingScore: 7 }),
  rubricFamily: 'CELPIP_GENERAL',
});

export const SAT_ASSESSMENT = new AssessmentType({
  code: 'SAT',
  displayName: 'SAT',
  providerSupport: ALL_PROVIDERS,
  capabilities: new AssessmentCapability({
    supportsWriting: true,
    supportsSpeaking: false,
    supportsReading: true,
    supportsListening: false,
    supportsGrammar: false,
    supportsVocabulary: false,
  }),
  scoringScale: new ScoringScale({ min: 200, max: 800, step: 10, passingScore: 500 }),
  rubricFamily: 'SAT',
});

export const ENGLISH_PROFICIENCY_ASSESSMENT = new AssessmentType({
  code: 'ENGLISH_PROFICIENCY',
  displayName: 'English Proficiency',
  providerSupport: ALL_PROVIDERS,
  capabilities: new AssessmentCapability({
    supportsWriting: true,
    supportsSpeaking: true,
    supportsReading: true,
    supportsListening: true,
    supportsGrammar: true,
    supportsVocabulary: true,
  }),
  scoringScale: new ScoringScale({ min: 0, max: 100, step: 1, passingScore: 60 }),
  rubricFamily: 'ENGLISH_PROFICIENCY',
});

/** All pre-defined assessment types for static registration. */
export const ALL_ASSESSMENT_TYPES: readonly AssessmentType[] = [
  IELTS_ASSESSMENT,
  TOEFL_ASSESSMENT,
  CELPIP_ASSESSMENT,
  SAT_ASSESSMENT,
  ENGLISH_PROFICIENCY_ASSESSMENT,
];
