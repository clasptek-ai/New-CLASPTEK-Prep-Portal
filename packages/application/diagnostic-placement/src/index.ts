import { randomUUID } from 'crypto';
import {
  DiagnosticCatalog,
  AssessmentForm,
  DiagnosticAttempt,
  Response,
  PlacementResult,
  SkillProfile,
  ExposureLedger,
  SelectionAudit,
  Recommendation,
  StageName,
  PlacementEngine,
} from '@clasptek/domain-diagnostic-placement';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY PORTS (INTERFACES)
// ═══════════════════════════════════════════════════════════════════

export interface DiagnosticRepository {
  findById(id: string): Promise<DiagnosticCatalog | null>;
  findByCode(code: string): Promise<DiagnosticCatalog | null>;
  save(catalog: DiagnosticCatalog): Promise<void>;
}

export interface AssessmentFormRepository {
  findById(id: string): Promise<AssessmentForm | null>;
  findByCatalogId(catalogId: string): Promise<AssessmentForm | null>;
  save(form: AssessmentForm): Promise<void>;
}

export interface AttemptRepository {
  findById(id: string): Promise<DiagnosticAttempt | null>;
  findActiveByStudentId(studentId: string, catalogId: string): Promise<DiagnosticAttempt | null>;
  save(attempt: DiagnosticAttempt): Promise<void>;
}

export interface ResponseRepository {
  save(response: Response): Promise<void>;
  findByAttemptId(attemptId: string): Promise<Response[]>;
}

export interface PlacementRepository {
  findById(id: string): Promise<PlacementResult | null>;
  findByAttemptId(attemptId: string): Promise<PlacementResult | null>;
  save(placement: PlacementResult): Promise<void>;
}

export interface SkillProfileRepository {
  findByStudentAndSkill(studentId: string, skillCode: string): Promise<SkillProfile | null>;
  findByStudentId(studentId: string): Promise<SkillProfile[]>;
  save(profile: SkillProfile): Promise<void>;
}

export interface RecommendationRepository {
  findByStudentId(studentId: string): Promise<Recommendation[]>;
  save(recommendation: Recommendation): Promise<void>;
}

export interface ExposureLedgerRepository {
  save(ledger: ExposureLedger): Promise<void>;
  hasBeenExposed(studentId: string, questionId: string): Promise<boolean>;
}

export interface SelectionAuditRepository {
  save(audit: SelectionAudit): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. COMMAND HANDLERS (MUTATIONS)
// ═══════════════════════════════════════════════════════════════════

export class CreateDiagnosticHandler {
  constructor(private readonly diagnosticRepo: DiagnosticRepository) {}
  public async execute(cmd: {
    id: string;
    examProductId: string;
    code: string;
    name: string;
    description: string;
    tenantId?: string;
  }): Promise<void> {
    const catalog = new DiagnosticCatalog(
      cmd.id,
      cmd.examProductId,
      cmd.code,
      cmd.name,
      cmd.description,
      'DRAFT',
      1,
      cmd.tenantId || '00000000-0000-0000-0000-000000000000'
    );
    await this.diagnosticRepo.save(catalog);
  }
}

export class StartAttemptHandler {
  constructor(private readonly attemptRepo: AttemptRepository) {}
  public async execute(cmd: {
    id: string;
    studentId: string;
    catalogId: string;
    tenantId?: string;
  }): Promise<void> {
    const attempt = DiagnosticAttempt.start(
      cmd.id,
      cmd.studentId,
      cmd.catalogId,
      cmd.tenantId || '00000000-0000-0000-0000-000000000000'
    );
    await this.attemptRepo.save(attempt);
  }
}

export class SubmitResponseHandler {
  constructor(
    private readonly attemptRepo: AttemptRepository,
    private readonly responseRepo: ResponseRepository,
    private readonly exposureRepo: ExposureLedgerRepository
  ) {}
  public async execute(cmd: {
    id: string;
    attemptId: string;
    questionId: string;
    questionVersionId: string;
    payload: Record<string, any>;
    isCorrect: boolean;
    timeSpentMs: number;
  }): Promise<void> {
    const attempt = await this.attemptRepo.findById(cmd.attemptId);
    if (!attempt) throw new Error(`Diagnostic attempt ${cmd.attemptId} not found`);

    const resp = attempt.submitResponse(
      cmd.id,
      cmd.questionId,
      cmd.questionVersionId,
      cmd.payload,
      cmd.isCorrect,
      cmd.timeSpentMs
    );

    // Save aggregate root and children
    await this.attemptRepo.save(attempt);
    await this.responseRepo.save(resp);

    // Track rendering exposure
    const ledger = new ExposureLedger(
      randomUUID(),
      attempt.studentId,
      cmd.questionId,
      attempt.id,
      new Date(),
      attempt.tenantId
    );
    await this.exposureRepo.save(ledger);
  }
}

export class CalculatePlacementHandler {
  constructor(
    private readonly attemptRepo: AttemptRepository,
    private readonly formRepo: AssessmentFormRepository,
    private readonly placementRepo: PlacementRepository,
    private readonly skillRepo: SkillProfileRepository
  ) {}
  public async execute(cmd: { attemptId: string; formId: string }): Promise<string> {
    const attempt = await this.attemptRepo.findById(cmd.attemptId);
    if (!attempt) throw new Error(`Attempt ${cmd.attemptId} not found`);

    const form = await this.formRepo.findById(cmd.formId);
    if (!form) throw new Error(`Assessment Form ${cmd.formId} not found`);

    // Detach current active attempt calculations
    const result = PlacementEngine.calculate(attempt, form);
    await this.placementRepo.save(result);

    // Update Student Skill Profiles for evaluated categories
    const accuracy =
      attempt.responses.filter((r) => r.isCorrect).length / (attempt.responses.length || 1);
    const mockStage: StageName = result.placementStage;

    const profile = new SkillProfile(
      randomUUID(),
      attempt.studentId,
      'Grammar',
      accuracy * 100,
      mockStage,
      attempt.tenantId
    );
    await this.skillRepo.save(profile);

    attempt.submit(accuracy * 100);
    await this.attemptRepo.save(attempt);

    return result.id;
  }
}
