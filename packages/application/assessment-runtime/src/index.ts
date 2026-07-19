import {
  AssessmentSession,
  StudentAnswerSheet,
  StudentAnswer,
  RuntimeCheckpoint,
  SubmissionRecord,
  QuestionVisit,
} from '@clasptek/domain-assessment-runtime';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY CONTRACTS (Rec 13)
// ═══════════════════════════════════════════════════════════════════

export interface AssessmentSessionRepository {
  save(session: AssessmentSession): Promise<void>;
  findById(id: string): Promise<AssessmentSession | null>;
  findActive(studentId: string): Promise<AssessmentSession | null>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  search(filters: {
    studentId?: string | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }): Promise<AssessmentSession[]>;
  nextIdentity(): string;
}

export interface AnswerSheetRepository {
  save(sheet: StudentAnswerSheet): Promise<void>;
  saveAnswer(sessionId: string, answer: StudentAnswer): Promise<void>;
  find(sessionId: string): Promise<StudentAnswerSheet | null>;
  submit(sessionId: string, record: SubmissionRecord): Promise<void>;
}

export interface CheckpointRepository {
  save(sessionId: string, checkpoint: RuntimeCheckpoint): Promise<void>;
  restore(sessionId: string): Promise<RuntimeCheckpoint | null>;
  deleteExpired(expiryDate: Date): Promise<void>;
}

export interface RuntimeStatisticsRepository {
  update(stats: any): Promise<void>;
  find(sessionId: string): Promise<any | null>;
  aggregate(studentId: string): Promise<any>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class CreateAssessmentSessionHandler {
  constructor(
    private readonly sessionRepo: AssessmentSessionRepository,
    private readonly sheetRepo: AnswerSheetRepository
  ) {}

  public async execute(cmd: {
    studentId: string;
    instanceId: string;
  }): Promise<string> {
    const active = await this.sessionRepo.findActive(cmd.studentId);
    if (active) throw new Error('Student already has an active assessment session');

    const id = this.sessionRepo.nextIdentity();
    const sheetId = this.sessionRepo.nextIdentity();

    const sheet = new StudentAnswerSheet({ id: sheetId, sessionId: id });
    const session = new AssessmentSession({
      id,
      studentId: cmd.studentId,
      instanceId: cmd.instanceId,
      status: 'READY',
      answerSheet: sheet,
    });

    await this.sessionRepo.save(session);
    await this.sheetRepo.save(sheet);
    return id;
  }
}

export class StartAssessmentHandler {
  constructor(private readonly sessionRepo: AssessmentSessionRepository) {}

  public async execute(cmd: { sessionId: string; at?: Date | undefined }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Assessment session not found');

    session.start(cmd.at ?? new Date());
    await this.sessionRepo.save(session);
  }
}

export class PauseAssessmentHandler {
  constructor(private readonly sessionRepo: AssessmentSessionRepository) {}

  public async execute(cmd: { sessionId: string; at?: Date | undefined }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Assessment session not found');

    session.pause(cmd.at ?? new Date());
    await this.sessionRepo.save(session);
  }
}

export class ResumeAssessmentHandler {
  constructor(private readonly sessionRepo: AssessmentSessionRepository) {}

  public async execute(cmd: { sessionId: string; token?: string | undefined; at?: Date | undefined }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Assessment session not found');

    session.resume(cmd.at ?? new Date(), cmd.token);
    await this.sessionRepo.save(session);
  }
}

export class SaveAnswerHandler {
  constructor(
    private readonly sessionRepo: AssessmentSessionRepository,
    private readonly sheetRepo: AnswerSheetRepository
  ) {}

  public async execute(cmd: {
    sessionId: string;
    questionId: string;
    questionVersionId: string;
    payload: any;
    state: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED';
    timeSpentMs: number;
    recordedAt?: Date | undefined;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Assessment session not found');

    const recordedAt = cmd.recordedAt ?? new Date();
    const answer = session.saveAnswer({
      questionId: cmd.questionId,
      questionVersionId: cmd.questionVersionId,
      payload: cmd.payload,
      state: cmd.state,
      timeSpentMs: cmd.timeSpentMs,
      recordedAt,
    });

    await this.sheetRepo.saveAnswer(session.id, answer);
    await this.sessionRepo.save(session);
  }
}

export class CreateCheckpointHandler {
  constructor(
    private readonly sessionRepo: AssessmentSessionRepository,
    private readonly checkpointRepo: CheckpointRepository
  ) {}

  public async execute(cmd: {
    sessionId: string;
    checkpointVersion: number;
    activeQuestionId: string | undefined;
    elapsedTimeMs: number;
    answersSnapshot: Record<string, any>;
    deviceFingerprint?: Record<string, any> | undefined;
    connectivitySnapshot?: Record<string, any> | undefined;
    checksum: string;
    recordedAt?: Date | undefined;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Assessment session not found');

    const recordedAt = cmd.recordedAt ?? new Date();
    session.createCheckpoint({
      checkpointVersion: cmd.checkpointVersion,
      activeQuestionId: cmd.activeQuestionId,
      elapsedTimeMs: cmd.elapsedTimeMs,
      answersSnapshot: cmd.answersSnapshot,
      deviceFingerprint: cmd.deviceFingerprint,
      connectivitySnapshot: cmd.connectivitySnapshot,
      checksum: cmd.checksum,
      recordedAt,
    });

    if (session.checkpoint) {
      await this.checkpointRepo.save(session.id, session.checkpoint);
    }
    await this.sessionRepo.save(session);
  }
}

export class SubmitAssessmentHandler {
  constructor(
    private readonly sessionRepo: AssessmentSessionRepository,
    private readonly sheetRepo: AnswerSheetRepository
  ) {}

  public async execute(cmd: {
    sessionId: string;
    signature: string;
    serverId: string;
    submittedAt?: Date | undefined;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Assessment session not found');

    const submittedAt = cmd.submittedAt ?? new Date();
    session.submit({
      signature: cmd.signature,
      serverId: cmd.serverId,
      submittedAt,
    });

    if (session.submission) {
      await this.sheetRepo.submit(session.id, session.submission);
    }
    await this.sessionRepo.save(session);
  }
}

export class ArchiveSessionHandler {
  constructor(private readonly sessionRepo: AssessmentSessionRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<void> {
    await this.sessionRepo.archive(cmd.sessionId);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class GetAssessmentSessionHandler {
  constructor(private readonly sessionRepo: AssessmentSessionRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<AssessmentSession | null> {
    return this.sessionRepo.findById(cmd.sessionId);
  }
}

export class GetAnswerSheetHandler {
  constructor(private readonly sheetRepo: AnswerSheetRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<StudentAnswerSheet | null> {
    return this.sheetRepo.find(cmd.sessionId);
  }
}

export class GetCheckpointHandler {
  constructor(private readonly checkpointRepo: CheckpointRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<RuntimeCheckpoint | null> {
    return this.checkpointRepo.restore(cmd.sessionId);
  }
}

export class GetRuntimeStatisticsHandler {
  constructor(private readonly statsRepo: RuntimeStatisticsRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<any | null> {
    return this.statsRepo.find(cmd.sessionId);
  }
}

export class GetNavigationHistoryHandler {
  constructor(private readonly sessionRepo: AssessmentSessionRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<readonly QuestionVisit[]> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) return [];
    return session.visits;
  }
}
