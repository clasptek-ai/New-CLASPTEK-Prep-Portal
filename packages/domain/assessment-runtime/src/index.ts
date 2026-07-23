import { Entity, AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. DOMAIN EVENT INFRASTRUCTURE (Rec 14)
// ═══════════════════════════════════════════════════════════════════

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseAssessmentEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {},
    occurredAt: Date = new Date()
  ) {
    this.occurredAt = occurredAt;
  }
}

export class AssessmentSessionCreated extends BaseAssessmentEvent {
  constructor(sessionId: string, studentId: string, instanceId: string, occurredAt?: Date) {
    super('AssessmentSessionCreated', sessionId, { studentId, instanceId }, occurredAt);
  }
}

export class AssessmentStarted extends BaseAssessmentEvent {
  constructor(sessionId: string, occurredAt?: Date) {
    super('AssessmentStarted', sessionId, {}, occurredAt);
  }
}

export class AssessmentPaused extends BaseAssessmentEvent {
  constructor(sessionId: string, occurredAt?: Date) {
    super('AssessmentPaused', sessionId, {}, occurredAt);
  }
}

export class AssessmentResumed extends BaseAssessmentEvent {
  constructor(sessionId: string, occurredAt?: Date) {
    super('AssessmentResumed', sessionId, {}, occurredAt);
  }
}

export class AssessmentDisconnected extends BaseAssessmentEvent {
  constructor(sessionId: string, occurredAt?: Date) {
    super('AssessmentDisconnected', sessionId, {}, occurredAt);
  }
}

export class CheckpointCreated extends BaseAssessmentEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('CheckpointCreated', sessionId, { checkpointVersion });
  }
}

export class AnswerSaved extends BaseAssessmentEvent {
  constructor(sessionId: string, questionVersionId: string) {
    super('AnswerSaved', sessionId, { questionVersionId });
  }
}

export class AnswerUpdated extends BaseAssessmentEvent {
  constructor(sessionId: string, questionVersionId: string) {
    super('AnswerUpdated', sessionId, { questionVersionId });
  }
}

export class QuestionVisited extends BaseAssessmentEvent {
  constructor(sessionId: string, questionId: string) {
    super('QuestionVisited', sessionId, { questionId });
  }
}

export class TimeWarningIssued extends BaseAssessmentEvent {
  constructor(sessionId: string, remainingTimeMs: number) {
    super('TimeWarningIssued', sessionId, { remainingTimeMs });
  }
}

export class SubmissionStarted extends BaseAssessmentEvent {
  constructor(sessionId: string) {
    super('SubmissionStarted', sessionId);
  }
}

export class AssessmentSubmitted extends BaseAssessmentEvent {
  constructor(sessionId: string) {
    super('AssessmentSubmitted', sessionId);
  }
}

export class SubmissionCompleted extends BaseAssessmentEvent {
  constructor(sessionId: string) {
    super('SubmissionCompleted', sessionId);
  }
}

export class SubmissionFailed extends BaseAssessmentEvent {
  constructor(sessionId: string, reason: string) {
    super('SubmissionFailed', sessionId, { reason });
  }
}

export class RuntimeArchived extends BaseAssessmentEvent {
  constructor(sessionId: string) {
    super('RuntimeArchived', sessionId);
  }
}

export class HeartbeatRecorded extends BaseAssessmentEvent {
  constructor(sessionId: string, heartbeatId: string) {
    super('HeartbeatRecorded', sessionId, { heartbeatId });
  }
}

export class SecurityIncidentDetected extends BaseAssessmentEvent {
  constructor(sessionId: string, incidentId: string) {
    super('SecurityIncidentDetected', sessionId, { incidentId });
  }
}

export class AutosaveCompleted extends BaseAssessmentEvent {
  constructor(sessionId: string, timestamp: Date) {
    super('AutosaveCompleted', sessionId, { timestamp });
  }
}

export class ResumeTokenIssued extends BaseAssessmentEvent {
  constructor(sessionId: string, token: string) {
    super('ResumeTokenIssued', sessionId, { token });
  }
}

export class ResumeTokenValidated extends BaseAssessmentEvent {
  constructor(sessionId: string) {
    super('ResumeTokenValidated', sessionId);
  }
}

export class SubmissionReceiptGenerated extends BaseAssessmentEvent {
  constructor(sessionId: string, checksum: string) {
    super('SubmissionReceiptGenerated', sessionId, { checksum });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class AssessmentSessionId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('AssessmentSessionId cannot be empty');
    super({ value });
  }
  get value(): string {
    return this.props.value;
  }
}

export class RemainingTime extends ValueObject<{ ms: number }> {
  constructor(ms: number) {
    if (ms < 0) throw new Error('RemainingTime cannot be negative');
    super({ ms });
  }
  get ms(): number {
    return this.props.ms;
  }
}

export class ElapsedTime extends ValueObject<{ ms: number }> {
  constructor(ms: number) {
    if (ms < 0) throw new Error('ElapsedTime cannot be negative');
    super({ ms });
  }
  get ms(): number {
    return this.props.ms;
  }
}

export interface QuestionSequenceItem {
  questionId: string;
  versionId: string;
  orderIndex: number;
  weight?: number | undefined;
}

export class QuestionSequence extends ValueObject<{ questions: QuestionSequenceItem[] }> {
  constructor(questions: QuestionSequenceItem[]) {
    const sorted = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
    super({ questions: sorted });
  }
  get questions(): readonly QuestionSequenceItem[] {
    return this.props.questions;
  }
}

export class TimerPolicy extends ValueObject<{
  type: 'Countdown' | 'Stopwatch' | 'SectionTimer' | 'PerQuestionTimer' | 'Unlimited';
  limitMs: number | undefined;
}> {
  constructor(
    type: 'Countdown' | 'Stopwatch' | 'SectionTimer' | 'PerQuestionTimer' | 'Unlimited',
    limitMs: number | undefined
  ) {
    super({ type, limitMs });
  }
  get type(): 'Countdown' | 'Stopwatch' | 'SectionTimer' | 'PerQuestionTimer' | 'Unlimited' {
    return this.props.type;
  }
  get limitMs(): number | undefined {
    return this.props.limitMs;
  }
}

export class NavigationPolicy extends ValueObject<{
  mode: 'Free' | 'Sequential' | 'NoBacktracking' | 'SectionLocked' | 'Adaptive';
}> {
  constructor(mode: 'Free' | 'Sequential' | 'NoBacktracking' | 'SectionLocked' | 'Adaptive') {
    super({ mode });
  }
  get mode(): 'Free' | 'Sequential' | 'NoBacktracking' | 'SectionLocked' | 'Adaptive' {
    return this.props.mode;
  }
}

export class AutosavePolicy extends ValueObject<{
  type: 'Interval' | 'OnNavigation' | 'OnAnswer' | 'ManualOnly';
  intervalMs: number | undefined;
}> {
  constructor(
    type: 'Interval' | 'OnNavigation' | 'OnAnswer' | 'ManualOnly',
    intervalMs: number | undefined
  ) {
    super({ type, intervalMs });
  }
  get type(): 'Interval' | 'OnNavigation' | 'OnAnswer' | 'ManualOnly' {
    return this.props.type;
  }
  get intervalMs(): number | undefined {
    return this.props.intervalMs;
  }
}

export class CheckpointVersion extends ValueObject<{ version: number }> {
  constructor(version: number) {
    if (version < 0) throw new Error('CheckpointVersion cannot be negative');
    super({ version });
  }
  get version(): number {
    return this.props.version;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. ENTITIES
// ═══════════════════════════════════════════════════════════════════

export class AnswerRevision extends Entity<string> {
  public readonly payload: any;
  public readonly state: string;
  public readonly revisionNumber: number;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    payload: any;
    state: string;
    revisionNumber: number;
    recordedAt: Date;
  }) {
    super(props.id);
    this.payload = props.payload;
    this.state = props.state;
    this.revisionNumber = props.revisionNumber;
    this.recordedAt = props.recordedAt;
  }
}

export class StudentAnswer extends Entity<string> {
  public readonly questionId: string;
  public readonly questionVersionId: string;
  private _payload: any;
  private _state: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED';
  private _timeSpentMs: number;
  private _revisions: AnswerRevision[] = [];
  public updatedAt: Date;

  constructor(props: {
    id: string;
    questionId: string;
    questionVersionId: string;
    payload: any;
    state: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED';
    timeSpentMs: number;
    revisions?: AnswerRevision[] | undefined;
    updatedAt: Date;
  }) {
    super(props.id);
    this.questionId = props.questionId;
    this.questionVersionId = props.questionVersionId;
    this._payload = props.payload;
    this._state = props.state;
    this._timeSpentMs = props.timeSpentMs;
    this.updatedAt = props.updatedAt;
    if (props.revisions) this._revisions = [...props.revisions];
  }

  get payload(): any {
    return this._payload;
  }
  get state(): 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED' {
    return this._state;
  }
  get timeSpentMs(): number {
    return this._timeSpentMs;
  }
  get revisions(): readonly AnswerRevision[] {
    return this._revisions;
  }

  public update(
    payload: any,
    state: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED',
    timeSpentMs: number,
    recordedAt: Date
  ): void {
    const revisionNumber = this._revisions.length + 1;
    const revision = new AnswerRevision({
      id: randomUUID(),
      payload: this._payload,
      state: this._state,
      revisionNumber,
      recordedAt,
    });
    this._revisions.push(revision);
    this._payload = payload;
    this._state = state;
    this._timeSpentMs = timeSpentMs;
    this.updatedAt = recordedAt;
  }
}

export class StudentAnswerSheet extends Entity<string> {
  public readonly sessionId: string;
  private _answers: StudentAnswer[] = [];

  constructor(props: { id: string; sessionId: string; answers?: StudentAnswer[] | undefined }) {
    super(props.id);
    this.sessionId = props.sessionId;
    if (props.answers) this._answers = [...props.answers];
  }

  get answers(): readonly StudentAnswer[] {
    return this._answers;
  }

  public getAnswerForQuestion(questionVersionId: string): StudentAnswer | undefined {
    return this._answers.find((a) => a.questionVersionId === questionVersionId);
  }

  public recordAnswer(props: {
    questionId: string;
    questionVersionId: string;
    payload: any;
    state: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED';
    timeSpentMs: number;
    recordedAt: Date;
  }): { answer: StudentAnswer; isNew: boolean } {
    let answer = this.getAnswerForQuestion(props.questionVersionId);
    let isNew = false;
    if (!answer) {
      isNew = true;
      answer = new StudentAnswer({
        id: randomUUID(),
        questionId: props.questionId,
        questionVersionId: props.questionVersionId,
        payload: props.payload,
        state: props.state,
        timeSpentMs: props.timeSpentMs,
        updatedAt: props.recordedAt,
      });
      this._answers.push(answer);
    } else {
      answer.update(props.payload, props.state, props.timeSpentMs, props.recordedAt);
    }
    return { answer, isNew };
  }
}

export class QuestionVisit extends Entity<string> {
  public readonly questionId: string;
  public readonly enteredAt: Date;
  public exitedAt: Date | undefined;
  public durationMs: number | undefined;

  constructor(props: {
    id: string;
    questionId: string;
    enteredAt: Date;
    exitedAt?: Date | undefined;
    durationMs?: number | undefined;
  }) {
    super(props.id);
    this.questionId = props.questionId;
    this.enteredAt = props.enteredAt;
    this.exitedAt = props.exitedAt;
    this.durationMs = props.durationMs;
  }

  public exit(exitedAt: Date): void {
    this.exitedAt = exitedAt;
    this.durationMs = exitedAt.getTime() - this.enteredAt.getTime();
  }
}

export class RuntimeCheckpoint extends Entity<string> {
  public readonly checkpointVersion: number;
  public readonly activeQuestionId: string | undefined;
  public readonly elapsedTimeMs: number;
  public readonly answersSnapshot: Record<string, any>;
  public readonly deviceFingerprint: Record<string, any> | undefined;
  public readonly connectivitySnapshot: Record<string, any> | undefined;
  public readonly checksum: string;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    checkpointVersion: number;
    activeQuestionId: string | undefined;
    elapsedTimeMs: number;
    answersSnapshot: Record<string, any>;
    deviceFingerprint?: Record<string, any> | undefined;
    connectivitySnapshot?: Record<string, any> | undefined;
    checksum: string;
    recordedAt: Date;
  }) {
    super(props.id);
    this.checkpointVersion = props.checkpointVersion;
    this.activeQuestionId = props.activeQuestionId;
    this.elapsedTimeMs = props.elapsedTimeMs;
    this.answersSnapshot = props.answersSnapshot;
    this.deviceFingerprint = props.deviceFingerprint;
    this.connectivitySnapshot = props.connectivitySnapshot;
    this.checksum = props.checksum;
    this.recordedAt = props.recordedAt;
  }
}

export class SecurityIncident extends Entity<string> {
  public readonly incidentType: string;
  public readonly payload: Record<string, any>;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    incidentType: string;
    payload: Record<string, any>;
    recordedAt: Date;
  }) {
    super(props.id);
    this.incidentType = props.incidentType;
    this.payload = props.payload;
    this.recordedAt = props.recordedAt;
  }
}

export class RuntimeHeartbeat extends Entity<string> {
  public readonly elapsedTimeMs: number;
  public readonly activeQuestionId: string | undefined;
  public readonly browserVisibility: string;
  public readonly networkStatus: string;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    elapsedTimeMs: number;
    activeQuestionId: string | undefined;
    browserVisibility: string;
    networkStatus: string;
    recordedAt: Date;
  }) {
    super(props.id);
    this.elapsedTimeMs = props.elapsedTimeMs;
    this.activeQuestionId = props.activeQuestionId;
    this.browserVisibility = props.browserVisibility;
    this.networkStatus = props.networkStatus;
    this.recordedAt = props.recordedAt;
  }
}

export class SubmissionRecord extends Entity<string> {
  public readonly receiptChecksum: string;
  public readonly signature: string;
  public readonly serverId: string;
  public readonly submittedAt: Date;

  constructor(props: {
    id: string;
    receiptChecksum: string;
    signature: string;
    serverId: string;
    submittedAt: Date;
  }) {
    super(props.id);
    this.receiptChecksum = props.receiptChecksum;
    this.signature = props.signature;
    this.serverId = props.serverId;
    this.submittedAt = props.submittedAt;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════

export class AssessmentInstance extends AggregateRoot<string> {
  public readonly questionSequence: QuestionSequence;
  public readonly timerPolicy: TimerPolicy;
  public readonly navigationPolicy: NavigationPolicy;
  public readonly autosavePolicy: AutosavePolicy;
  public readonly metadata: Record<string, any>;

  constructor(props: {
    id: string;
    questionSequence: QuestionSequence;
    timerPolicy: TimerPolicy;
    navigationPolicy: NavigationPolicy;
    autosavePolicy: AutosavePolicy;
    metadata: Record<string, any>;
  }) {
    super(props.id);
    this.questionSequence = props.questionSequence;
    this.timerPolicy = props.timerPolicy;
    this.navigationPolicy = props.navigationPolicy;
    this.autosavePolicy = props.autosavePolicy;
    this.metadata = props.metadata;
  }
}

export class AssessmentSession extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly instanceId: string;
  private _status:
    | 'DRAFT'
    | 'GENERATED'
    | 'READY'
    | 'ACTIVE'
    | 'PAUSED'
    | 'DISCONNECTED'
    | 'RESUMED'
    | 'SUBMITTING'
    | 'SUBMITTED'
    | 'EVALUATED'
    | 'ARCHIVED';
  public readonly answerSheet: StudentAnswerSheet;
  private _checkpoint: RuntimeCheckpoint | undefined;
  private _securityIncidents: SecurityIncident[] = [];
  private _heartbeats: RuntimeHeartbeat[] = [];
  private _visits: QuestionVisit[] = [];
  private _submission: SubmissionRecord | undefined;
  public resumeToken: string | undefined;
  public lockVersion: number;

  constructor(props: {
    id: string;
    studentId: string;
    instanceId: string;
    status:
      | 'DRAFT'
      | 'GENERATED'
      | 'READY'
      | 'ACTIVE'
      | 'PAUSED'
      | 'DISCONNECTED'
      | 'RESUMED'
      | 'SUBMITTING'
      | 'SUBMITTED'
      | 'EVALUATED'
      | 'ARCHIVED';
    answerSheet: StudentAnswerSheet;
    checkpoint?: RuntimeCheckpoint | undefined;
    securityIncidents?: SecurityIncident[] | undefined;
    heartbeats?: RuntimeHeartbeat[] | undefined;
    visits?: QuestionVisit[] | undefined;
    submission?: SubmissionRecord | undefined;
    resumeToken?: string | undefined;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.instanceId = props.instanceId;
    this._status = props.status;
    this.answerSheet = props.answerSheet;
    this._checkpoint = props.checkpoint;
    this._submission = props.submission;
    this.resumeToken = props.resumeToken;
    this.lockVersion = props.lockVersion ?? 0;
    if (props.securityIncidents) this._securityIncidents = [...props.securityIncidents];
    if (props.heartbeats) this._heartbeats = [...props.heartbeats];
    if (props.visits) this._visits = [...props.visits];
  }

  get status():
    | 'DRAFT'
    | 'GENERATED'
    | 'READY'
    | 'ACTIVE'
    | 'PAUSED'
    | 'DISCONNECTED'
    | 'RESUMED'
    | 'SUBMITTING'
    | 'SUBMITTED'
    | 'EVALUATED'
    | 'ARCHIVED' {
    return this._status;
  }
  get checkpoint(): RuntimeCheckpoint | undefined {
    return this._checkpoint;
  }
  get securityIncidents(): readonly SecurityIncident[] {
    return this._securityIncidents;
  }
  get heartbeats(): readonly RuntimeHeartbeat[] {
    return this._heartbeats;
  }
  get visits(): readonly QuestionVisit[] {
    return this._visits;
  }
  get submission(): SubmissionRecord | undefined {
    return this._submission;
  }

  public start(at: Date): void {
    if (this._status !== 'DRAFT' && this._status !== 'GENERATED' && this._status !== 'READY') {
      throw new Error('Session must be in Draft, Generated or Ready state to start');
    }
    this._status = 'ACTIVE';
    this.addDomainEvent(new AssessmentStarted(this.id, at));
  }

  public pause(at: Date): void {
    if (this._status !== 'ACTIVE' && this._status !== 'RESUMED') {
      throw new Error('Session must be active to pause');
    }
    this._status = 'PAUSED';
    this.addDomainEvent(new AssessmentPaused(this.id, at));
  }

  public resume(at: Date, token?: string): void {
    if (this._status !== 'PAUSED' && this._status !== 'DISCONNECTED') {
      throw new Error('Session must be paused or disconnected to resume');
    }
    if (token && this.resumeToken && token !== this.resumeToken) {
      throw new Error('Invalid resume token provided');
    }
    this._status = 'RESUMED';
    this.addDomainEvent(new AssessmentResumed(this.id, at));
  }

  public disconnect(at: Date): void {
    if (this._status !== 'ACTIVE' && this._status !== 'RESUMED') {
      throw new Error('Session must be active to trigger disconnect');
    }
    this._status = 'DISCONNECTED';
    this.addDomainEvent(new AssessmentDisconnected(this.id, at));
  }

  public saveAnswer(props: {
    questionId: string;
    questionVersionId: string;
    payload: any;
    state: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED';
    timeSpentMs: number;
    recordedAt: Date;
  }): StudentAnswer {
    if (['SUBMITTED', 'EVALUATED', 'ARCHIVED'].includes(this._status)) {
      throw new Error('Cannot modify answers on a submitted assessment session');
    }
    const { answer, isNew } = this.answerSheet.recordAnswer(props);
    if (isNew) {
      this.addDomainEvent(new AnswerSaved(this.id, props.questionVersionId));
    } else {
      this.addDomainEvent(new AnswerUpdated(this.id, props.questionVersionId));
    }
    return answer;
  }

  public recordHeartbeat(props: {
    elapsedTimeMs: number;
    activeQuestionId: string | undefined;
    browserVisibility: string;
    networkStatus: string;
    recordedAt: Date;
  }): void {
    const lastHb = this._heartbeats[this._heartbeats.length - 1];
    if (lastHb && props.elapsedTimeMs < lastHb.elapsedTimeMs) {
      throw new Error('ElapsedTime cannot move backwards');
    }
    const heartbeat = new RuntimeHeartbeat({
      id: randomUUID(),
      elapsedTimeMs: props.elapsedTimeMs,
      activeQuestionId: props.activeQuestionId,
      browserVisibility: props.browserVisibility,
      networkStatus: props.networkStatus,
      recordedAt: props.recordedAt,
    });
    this._heartbeats.push(heartbeat);
    this.addDomainEvent(new HeartbeatRecorded(this.id, heartbeat.id));
  }

  public recordSecurityIncident(props: {
    incidentType: string;
    payload: Record<string, any>;
    recordedAt: Date;
  }): void {
    const incident = new SecurityIncident({
      id: randomUUID(),
      incidentType: props.incidentType,
      payload: props.payload,
      recordedAt: props.recordedAt,
    });
    this._securityIncidents.push(incident);
    this.addDomainEvent(new SecurityIncidentDetected(this.id, incident.id));
  }

  public createCheckpoint(props: {
    checkpointVersion: number;
    activeQuestionId: string | undefined;
    elapsedTimeMs: number;
    answersSnapshot: Record<string, any>;
    deviceFingerprint?: Record<string, any> | undefined;
    connectivitySnapshot?: Record<string, any> | undefined;
    checksum: string;
    recordedAt: Date;
  }): void {
    if (this._checkpoint && props.checkpointVersion <= this._checkpoint.checkpointVersion) {
      throw new Error('Checkpoint version must increase monotonically');
    }
    const checkpoint = new RuntimeCheckpoint({
      id: randomUUID(),
      checkpointVersion: props.checkpointVersion,
      activeQuestionId: props.activeQuestionId,
      elapsedTimeMs: props.elapsedTimeMs,
      answersSnapshot: props.answersSnapshot,
      deviceFingerprint: props.deviceFingerprint,
      connectivitySnapshot: props.connectivitySnapshot,
      checksum: props.checksum,
      recordedAt: props.recordedAt,
    });
    this._checkpoint = checkpoint;
    this.addDomainEvent(new CheckpointCreated(this.id, props.checkpointVersion));
  }

  public visitQuestion(props: { questionId: string; enteredAt: Date }): QuestionVisit {
    const activeVisit = this._visits.find((v) => !v.exitedAt);
    if (activeVisit) {
      activeVisit.exit(props.enteredAt);
    }
    const visit = new QuestionVisit({
      id: randomUUID(),
      questionId: props.questionId,
      enteredAt: props.enteredAt,
    });
    this._visits.push(visit);
    this.addDomainEvent(new QuestionVisited(this.id, props.questionId));
    return visit;
  }

  public submit(props: { signature: string; serverId: string; submittedAt: Date }): void {
    if (this._status === 'SUBMITTED' || this._status === 'EVALUATED') {
      throw new Error('Session is already submitted');
    }
    this._status = 'SUBMITTING';
    this.addDomainEvent(new SubmissionStarted(this.id));

    // Generate submission record
    const ansChecksum = this.calculateAnswersChecksum();
    this._submission = new SubmissionRecord({
      id: randomUUID(),
      receiptChecksum: ansChecksum,
      signature: props.signature,
      serverId: props.serverId,
      submittedAt: props.submittedAt,
    });

    this._status = 'SUBMITTED';
    this.addDomainEvent(new AssessmentSubmitted(this.id));
    this.addDomainEvent(new SubmissionCompleted(this.id));
  }

  private calculateAnswersChecksum(): string {
    const serialized = JSON.stringify(
      this.answerSheet.answers
        .map((a) => ({
          qvId: a.questionVersionId,
          payload: a.payload,
          state: a.state,
        }))
        .sort((a, b) => a.qvId.localeCompare(b.qvId))
    );
    // Simple checksum simulator hash
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      hash = (hash << 5) - hash + serialized.charCodeAt(i);
      hash |= 0;
    }
    return `hash-${Math.abs(hash)}`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CANONICAL DELIVERY DOMAIN EXPORTS (Sprint 3.4.1)
// ═══════════════════════════════════════════════════════════════════
export * from './value-objects/delivery-value-objects';
export * from './entities/assessment-attempt.entity';
export * from './aggregates/assessment-result.aggregate';
export * from './services/assessment-scoring.service';
export * from './services/timer-policy';
export * from './state-machine/assessment-session.state-machine';
export * from './strategies/result-visibility.strategy';
export * from './specifications/delivery-specifications';
export * from './events/delivery-events';
export * from './repositories/delivery-repositories';
