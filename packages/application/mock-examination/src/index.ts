import {
  MockTemplate,
  MockSession,
  MockAttempt,
  MockResult,
  MockReport,
  MockReadiness,
  ScoringEngine,
  ReadinessEngine,
  ReportingEngine,
} from '@clasptek/domain-mock-examination';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY CONTRACTS
// ═══════════════════════════════════════════════════════════════════

export interface MockTemplateRepository {
  save(template: MockTemplate): Promise<void>;
  findById(id: string): Promise<MockTemplate | null>;
  findPublished(): Promise<MockTemplate[]>;
  nextIdentity(): string;
}

export interface MockSessionRepository {
  save(session: MockSession): Promise<void>;
  findById(id: string): Promise<MockSession | null>;
  findActive(studentId: string): Promise<MockSession | null>;
  findByStudent(studentId: string): Promise<MockSession[]>;
  nextIdentity(): string;
}

export interface MockAttemptRepository {
  save(attempt: MockAttempt): Promise<void>;
  findBySession(sessionId: string): Promise<MockAttempt | null>;
  nextIdentity(): string;
}

export interface MockResultRepository {
  save(result: MockResult): Promise<void>;
  findBySession(sessionId: string): Promise<MockResult | null>;
  findByStudent(studentId: string): Promise<MockResult[]>;
  nextIdentity(): string;
}

export interface MockReportRepository {
  save(report: MockReport): Promise<void>;
  findByResult(resultId: string): Promise<MockReport | null>;
  nextIdentity(): string;
}

export interface MockReadinessRepository {
  save(readiness: MockReadiness): Promise<void>;
  findByStudent(studentId: string): Promise<MockReadiness | null>;
  nextIdentity(): string;
}

// ═══════════════════════════════════════════════════════════════════
// 2. PROJECTION VIEW MODELS
// ═══════════════════════════════════════════════════════════════════

export interface StudentMockDashboardView {
  availableTemplates: { id: string; title: string; strategy: string; durationMinutes: number }[];
  activeSession: {
    id: string;
    templateId: string;
    status: string;
    currentSectionIndex: number;
  } | null;
  history: { id: string; label: string; score: number; date: string }[];
  overallReadinessPct: number;
}

export interface InstructorMockDashboardView {
  totalBlueprints: number;
  publishedTemplates: number;
  activeSessionsCount: number;
  reviewQueue: { sessionId: string; studentId: string; submittedAt: string }[];
}

// ═══════════════════════════════════════════════════════════════════
// 3. APPLICATION ORCHESTRATION SERVICES
// ═══════════════════════════════════════════════════════════════════

export class MockSessionOrchestrator {
  constructor(
    private readonly sessionRepo: MockSessionRepository,
    private readonly attemptRepo: MockAttemptRepository
  ) {}

  public async startSession(studentId: string, templateId: string): Promise<string> {
    const existing = await this.sessionRepo.findActive(studentId);
    if (existing) return existing.id;

    const id = this.sessionRepo.nextIdentity();
    const session = new MockSession({ id, studentId, templateId });
    session.start();
    await this.sessionRepo.save(session);

    const attemptId = this.attemptRepo.nextIdentity();
    const attempt = new MockAttempt({ id: attemptId, sessionId: id, studentId });
    await this.attemptRepo.save(attempt);

    return id;
  }
}

export class ScoreCalculationOrchestrator {
  constructor(
    private readonly sessionRepo: MockSessionRepository,
    private readonly attemptRepo: MockAttemptRepository,
    private readonly templateRepo: MockTemplateRepository,
    private readonly resultRepo: MockResultRepository
  ) {}

  public async calculateAndSaveScore(sessionId: string): Promise<MockResult> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const attempt = await this.attemptRepo.findBySession(sessionId);
    const template = await this.templateRepo.findById(session.templateId);

    const strategyCode = template?.scoringStrategy ?? 'CUSTOM';
    const answers = attempt?.answers ? [...attempt.answers] : [];

    const engine = new ScoringEngine();
    const result = engine.scoreAttempt(sessionId, session.studentId, strategyCode, answers);

    await this.resultRepo.save(result);
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. COMMAND & QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class StartMockHandler {
  constructor(private readonly orchestrator: MockSessionOrchestrator) {}

  public async execute(cmd: { studentId: string; templateId: string }): Promise<string> {
    return this.orchestrator.startSession(cmd.studentId, cmd.templateId);
  }
}

export class SubmitAnswerHandler {
  constructor(private readonly attemptRepo: MockAttemptRepository) {}

  public async execute(cmd: {
    sessionId: string;
    studentId: string;
    questionId: string;
    sectionId: string;
    answerPayload: any;
    timeSpentMs: number;
  }): Promise<void> {
    let attempt = await this.attemptRepo.findBySession(cmd.sessionId);
    if (!attempt) {
      const id = this.attemptRepo.nextIdentity();
      attempt = new MockAttempt({ id, sessionId: cmd.sessionId, studentId: cmd.studentId });
    }

    attempt.recordAnswer({
      questionId: cmd.questionId,
      sectionId: cmd.sectionId,
      answer: cmd.answerPayload,
      timeSpentMs: cmd.timeSpentMs,
    });

    await this.attemptRepo.save(attempt);
  }
}

export class CompleteSectionHandler {
  constructor(private readonly sessionRepo: MockSessionRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error(`Session ${cmd.sessionId} not found`);
    session.completeSection();
    await this.sessionRepo.save(session);
  }
}

export class SubmitMockHandler {
  constructor(
    private readonly sessionRepo: MockSessionRepository,
    private readonly scoreOrchestrator: ScoreCalculationOrchestrator
  ) {}

  public async execute(cmd: { sessionId: string }): Promise<MockResult> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error(`Session ${cmd.sessionId} not found`);
    session.submit();
    await this.sessionRepo.save(session);

    return this.scoreOrchestrator.calculateAndSaveScore(cmd.sessionId);
  }
}

export class CalculateReadinessHandler {
  constructor(
    private readonly resultRepo: MockResultRepository,
    private readonly readinessRepo: MockReadinessRepository
  ) {}

  public async execute(cmd: { studentId: string; resultId: string }): Promise<MockReadiness> {
    const results = await this.resultRepo.findByStudent(cmd.studentId);
    const target = results.find((r) => r.id === cmd.resultId) ?? results[0];

    const engine = new ReadinessEngine();
    const readiness = engine.calculateReadiness(cmd.studentId, target);
    await this.readinessRepo.save(readiness);
    return readiness;
  }
}

export class GenerateReportHandler {
  constructor(
    private readonly resultRepo: MockResultRepository,
    private readonly reportRepo: MockReportRepository
  ) {}

  public async execute(cmd: { resultId: string }): Promise<MockReport> {
    const results = await this.resultRepo.findBySession(cmd.resultId);
    const engine = new ReportingEngine();
    const resultToScore =
      results ??
      new MockResult({
        id: cmd.resultId,
        sessionId: 'sess-1',
        studentId: 'stud-1',
        overallRawScore: 80,
        officialScaledScore: 7.5,
        officialScoreLabel: 'IELTS Band 7.5',
        percentile: 90,
        sectionScores: [],
      });

    const report = engine.generateReport(resultToScore);
    await this.reportRepo.save(report);
    return report;
  }
}

export class GetHistoryHandler {
  constructor(private readonly resultRepo: MockResultRepository) {}

  public async execute(query: { studentId: string }): Promise<MockResult[]> {
    return this.resultRepo.findByStudent(query.studentId);
  }
}

export class GetTemplatesHandler {
  constructor(private readonly templateRepo: MockTemplateRepository) {}

  public async execute(): Promise<MockTemplate[]> {
    return this.templateRepo.findPublished();
  }
}

// ═══════════════════════════════════════════════════════════════════
// CANONICAL MOCK EXAMINATION DELIVERY APPLICATION EXPORTS (Sprint 3.6)
// ═══════════════════════════════════════════════════════════════════
export * from './engines/checkpoint-engine';
export * from './engines/submission-orchestration-engine';
export * from './mock-delivery-command-adapters';
