import { AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. DOMAIN EVENTS
// ═══════════════════════════════════════════════════════════════════

export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  payload: Record<string, any>;
  occurredOn: Date;
}

export abstract class BaseMockEvent implements DomainEvent {
  public readonly occurredOn: Date;
  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any>
  ) {
    this.occurredOn = new Date();
  }
}

export class MockStarted extends BaseMockEvent {
  constructor(sessionId: string, studentId: string, templateId: string) {
    super('MockStarted', sessionId, { studentId, templateId });
  }
}

export class AnswerSubmitted extends BaseMockEvent {
  constructor(attemptId: string, questionId: string, sectionId: string) {
    super('AnswerSubmitted', attemptId, { questionId, sectionId });
  }
}

export class SectionCompleted extends BaseMockEvent {
  constructor(sessionId: string, sectionIndex: number) {
    super('SectionCompleted', sessionId, { sectionIndex });
  }
}

export class MockSubmitted extends BaseMockEvent {
  constructor(sessionId: string, studentId: string) {
    super('MockSubmitted', sessionId, { studentId });
  }
}

export class MockScored extends BaseMockEvent {
  constructor(resultId: string, sessionId: string, officialScoreLabel: string) {
    super('MockScored', resultId, { sessionId, officialScoreLabel });
  }
}

export class ReadinessCalculated extends BaseMockEvent {
  constructor(readinessId: string, studentId: string, overallReadinessPct: number) {
    super('ReadinessCalculated', readinessId, { studentId, overallReadinessPct });
  }
}

export class MockPassed extends BaseMockEvent {
  constructor(resultId: string, studentId: string) {
    super('MockPassed', resultId, { studentId });
  }
}

export class MockFailed extends BaseMockEvent {
  constructor(resultId: string, studentId: string) {
    super('MockFailed', resultId, { studentId });
  }
}

export class ReportGenerated extends BaseMockEvent {
  constructor(reportId: string, resultId: string) {
    super('ReportGenerated', reportId, { resultId });
  }
}

export class SessionRecovered extends BaseMockEvent {
  constructor(sessionId: string) {
    super('SessionRecovered', sessionId, {});
  }
}

export class AutoSubmitted extends BaseMockEvent {
  constructor(sessionId: string, reason: string) {
    super('AutoSubmitted', sessionId, { reason });
  }
}

export class TimeExpired extends BaseMockEvent {
  constructor(sessionId: string, sectionIndex: number) {
    super('TimeExpired', sessionId, { sectionIndex });
  }
}

export class BreakStarted extends BaseMockEvent {
  constructor(sessionId: string, durationMinutes: number) {
    super('BreakStarted', sessionId, { durationMinutes });
  }
}

export class BreakCompleted extends BaseMockEvent {
  constructor(sessionId: string) {
    super('BreakCompleted', sessionId, {});
  }
}

export class ScorePublished extends BaseMockEvent {
  constructor(resultId: string) {
    super('ScorePublished', resultId, {});
  }
}

export class RecommendationGenerated extends BaseMockEvent {
  constructor(studentId: string, recommendedHours: number) {
    super('RecommendationGenerated', studentId, { recommendedHours });
  }
}

export class BlueprintCreated extends BaseMockEvent {
  constructor(blueprintId: string, title: string) {
    super('BlueprintCreated', blueprintId, { title });
  }
}

export class TemplatePublished extends BaseMockEvent {
  constructor(templateId: string, version: number) {
    super('TemplatePublished', templateId, { version });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class MockScore extends ValueObject<{ rawValue: number }> {
  constructor(rawValue: number) {
    if (rawValue < 0 || rawValue > 100) {
      throw new Error(`MockScore must be between 0 and 100, got ${rawValue}`);
    }
    super({ rawValue });
  }
  get rawValue(): number {
    return this.props.rawValue;
  }
}

export class OfficialScore extends ValueObject<{ label: string; numericValue: number }> {
  constructor(label: string, numericValue: number) {
    super({ label, numericValue });
  }
  get label(): string {
    return this.props.label;
  }
  get numericValue(): number {
    return this.props.numericValue;
  }
}

export class SectionScore extends ValueObject<{
  sectionId: string;
  rawScore: number;
  scaledScore: number;
  maxScore: number;
  accuracyPct: number;
}> {
  constructor(props: {
    sectionId: string;
    rawScore: number;
    scaledScore: number;
    maxScore: number;
    accuracyPct: number;
  }) {
    super(props);
  }
  get sectionId(): string {
    return this.props.sectionId;
  }
  get rawScore(): number {
    return this.props.rawScore;
  }
  get scaledScore(): number {
    return this.props.scaledScore;
  }
  get maxScore(): number {
    return this.props.maxScore;
  }
  get accuracyPct(): number {
    return this.props.accuracyPct;
  }
}

export class Percentile extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) throw new Error(`Percentile must be 0-100, got ${value}`);
    super({ value });
  }
  get value(): number {
    return this.props.value;
  }
}

export class ReadinessScore extends ValueObject<{ percentage: number }> {
  constructor(percentage: number) {
    if (percentage < 0 || percentage > 100)
      throw new Error(`ReadinessScore must be 0-100, got ${percentage}`);
    super({ percentage });
  }
  get percentage(): number {
    return this.props.percentage;
  }
}

export class ExaminationTimer extends ValueObject<{
  durationMinutes: number;
  breakAfterMinutes: number;
}> {
  constructor(durationMinutes: number, breakAfterMinutes: number = 0) {
    super({ durationMinutes, breakAfterMinutes });
  }
  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
  get breakAfterMinutes(): number {
    return this.props.breakAfterMinutes;
  }
}

export class TimeRemaining extends ValueObject<{ seconds: number }> {
  constructor(seconds: number) {
    super({ seconds: Math.max(0, seconds) });
  }
  get seconds(): number {
    return this.props.seconds;
  }
  get isExpired(): boolean {
    return this.props.seconds <= 0;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. AGGREGATES & ENTITIES
// ═══════════════════════════════════════════════════════════════════

export type BlueprintStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export class MockBlueprint extends AggregateRoot<string> {
  public readonly examCode: string;
  public readonly title: string;
  public readonly description?: string | undefined;
  public readonly scoringStrategy: string;
  private _status: BlueprintStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    examCode: string;
    title: string;
    description?: string | undefined;
    scoringStrategy: string;
    status?: BlueprintStatus | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
  }) {
    super(props.id);
    this.examCode = props.examCode;
    this.title = props.title;
    this.description = props.description;
    this.scoringStrategy = props.scoringStrategy;
    this._status = props.status ?? 'DRAFT';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get status(): BlueprintStatus {
    return this._status;
  }

  public submitForReview(): void {
    if (this._status !== 'DRAFT') throw new Error('Blueprint must be DRAFT to submit for review');
    this._status = 'UNDER_REVIEW';
    this.updatedAt = new Date();
  }

  public approve(): void {
    if (this._status !== 'UNDER_REVIEW')
      throw new Error('Blueprint must be UNDER_REVIEW to approve');
    this._status = 'APPROVED';
    this.updatedAt = new Date();
  }

  public publish(): void {
    if (this._status !== 'APPROVED') throw new Error('Blueprint must be APPROVED to publish');
    this._status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public static create(
    id: string,
    examCode: string,
    title: string,
    scoringStrategy: string,
    description?: string
  ): MockBlueprint {
    const bp = new MockBlueprint({ id, examCode, title, scoringStrategy, description });
    bp.addDomainEvent(new BlueprintCreated(id, title));
    return bp;
  }
}

export class MockTemplateSection {
  public readonly id: string;
  public readonly templateId: string;
  public readonly sectionName: string;
  public readonly orderIndex: number;
  public readonly durationMinutes: number;
  public readonly questionCount: number;
  public readonly weight: number;
  public readonly lockOnComplete: boolean;
  public readonly breakAfterMinutes: number;

  constructor(props: {
    id: string;
    templateId: string;
    sectionName: string;
    orderIndex: number;
    durationMinutes: number;
    questionCount: number;
    weight: number;
    lockOnComplete?: boolean | undefined;
    breakAfterMinutes?: number | undefined;
  }) {
    this.id = props.id;
    this.templateId = props.templateId;
    this.sectionName = props.sectionName;
    this.orderIndex = props.orderIndex;
    this.durationMinutes = props.durationMinutes;
    this.questionCount = props.questionCount;
    this.weight = props.weight;
    this.lockOnComplete = props.lockOnComplete ?? true;
    this.breakAfterMinutes = props.breakAfterMinutes ?? 0;
  }
}

export class MockTemplate extends AggregateRoot<string> {
  public readonly blueprintId: string;
  public readonly version: number;
  public readonly parentTemplateId?: string | undefined;
  public readonly publishedAt?: Date | undefined;
  public readonly publishedBy?: string | undefined;
  public readonly totalDurationMinutes: number;
  public readonly passingScore: number;
  public readonly scoringStrategy: string;
  public readonly sections: readonly MockTemplateSection[];
  private _status: 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED';

  constructor(props: {
    id: string;
    blueprintId: string;
    version: number;
    parentTemplateId?: string | undefined;
    publishedAt?: Date | undefined;
    publishedBy?: string | undefined;
    totalDurationMinutes: number;
    passingScore: number;
    scoringStrategy: string;
    sections: MockTemplateSection[];
    status?: 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED' | undefined;
  }) {
    super(props.id);
    this.blueprintId = props.blueprintId;
    this.version = props.version;
    this.parentTemplateId = props.parentTemplateId;
    this.publishedAt = props.publishedAt ?? new Date();
    this.publishedBy = props.publishedBy;
    this.totalDurationMinutes = props.totalDurationMinutes;
    this.passingScore = props.passingScore;
    this.scoringStrategy = props.scoringStrategy;
    this.sections = [...props.sections];
    this._status = props.status ?? 'PUBLISHED';
  }

  get status(): 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED' {
    return this._status;
  }
}

export type SessionStatus =
  'SCHEDULED' | 'IN_PROGRESS' | 'SECTION_PAUSED' | 'SUBMITTED' | 'EXPIRED';

export class MockSession extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly templateId: string;
  public readonly version: number;
  private _status: SessionStatus;
  private _currentSectionIndex: number;
  private _timeRemainingSeconds: number;
  public startedAt?: Date | undefined;
  public submittedAt?: Date | undefined;

  constructor(props: {
    id: string;
    studentId: string;
    templateId: string;
    version?: number | undefined;
    status?: SessionStatus | undefined;
    currentSectionIndex?: number | undefined;
    timeRemainingSeconds?: number | undefined;
    startedAt?: Date | undefined;
    submittedAt?: Date | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.templateId = props.templateId;
    this.version = props.version ?? 1;
    this._status = props.status ?? 'SCHEDULED';
    this._currentSectionIndex = props.currentSectionIndex ?? 0;
    this._timeRemainingSeconds = props.timeRemainingSeconds ?? 10800;
    this.startedAt = props.startedAt;
    this.submittedAt = props.submittedAt;
  }

  get status(): SessionStatus {
    return this._status;
  }
  get currentSectionIndex(): number {
    return this._currentSectionIndex;
  }
  get timeRemainingSeconds(): number {
    return this._timeRemainingSeconds;
  }

  public start(): void {
    if (this._status !== 'SCHEDULED')
      throw new Error('Session can only start from SCHEDULED state');
    this._status = 'IN_PROGRESS';
    this.startedAt = new Date();
    this.addDomainEvent(new MockStarted(this.id, this.studentId, this.templateId));
  }

  public completeSection(): void {
    if (this._status !== 'IN_PROGRESS')
      throw new Error('Cannot complete section unless IN_PROGRESS');
    this.addDomainEvent(new SectionCompleted(this.id, this._currentSectionIndex));
    this._currentSectionIndex += 1;
  }

  public submit(): void {
    if (this._status !== 'IN_PROGRESS' && this._status !== 'SECTION_PAUSED') {
      throw new Error('Cannot submit session unless active or paused');
    }
    this._status = 'SUBMITTED';
    this.submittedAt = new Date();
    this.addDomainEvent(new MockSubmitted(this.id, this.studentId));
  }

  public expire(): void {
    this._status = 'EXPIRED';
    this.submittedAt = new Date();
    this.addDomainEvent(new AutoSubmitted(this.id, 'TIME_EXPIRED'));
  }
}

export interface MockAnswerPayload {
  questionId: string;
  sectionId: string;
  answer: any;
  timeSpentMs: number;
  confidenceLevel?: string | undefined;
  isCorrect?: boolean | undefined;
}

export class MockAttempt extends AggregateRoot<string> {
  public readonly sessionId: string;
  public readonly studentId: string;
  private _answers: Map<string, MockAnswerPayload>;
  private _flaggedQuestions: Set<string>;

  constructor(props: {
    id: string;
    sessionId: string;
    studentId: string;
    answers?: MockAnswerPayload[] | undefined;
    flaggedQuestions?: string[] | undefined;
  }) {
    super(props.id);
    this.sessionId = props.sessionId;
    this.studentId = props.studentId;
    this._answers = new Map();
    if (props.answers) {
      for (const a of props.answers) this._answers.set(a.questionId, a);
    }
    this._flaggedQuestions = new Set(props.flaggedQuestions ?? []);
  }

  get answers(): readonly MockAnswerPayload[] {
    return Array.from(this._answers.values());
  }
  get flaggedQuestions(): readonly string[] {
    return Array.from(this._flaggedQuestions.values());
  }

  public recordAnswer(answer: MockAnswerPayload): void {
    this._answers.set(answer.questionId, answer);
    this.addDomainEvent(new AnswerSubmitted(this.id, answer.questionId, answer.sectionId));
  }

  public toggleFlag(questionId: string): void {
    if (this._flaggedQuestions.has(questionId)) this._flaggedQuestions.delete(questionId);
    else this._flaggedQuestions.add(questionId);
  }
}

export class MockResult extends AggregateRoot<string> {
  public readonly sessionId: string;
  public readonly studentId: string;
  public readonly overallRawScore: number;
  public readonly officialScaledScore: number;
  public readonly officialScoreLabel: string;
  public readonly percentile: number;
  public readonly sectionScores: readonly SectionScore[];
  private _status: 'PENDING' | 'SCORED' | 'PUBLISHED';

  constructor(props: {
    id: string;
    sessionId: string;
    studentId: string;
    overallRawScore: number;
    officialScaledScore: number;
    officialScoreLabel: string;
    percentile: number;
    sectionScores: SectionScore[];
    status?: 'PENDING' | 'SCORED' | 'PUBLISHED' | undefined;
  }) {
    super(props.id);
    this.sessionId = props.sessionId;
    this.studentId = props.studentId;
    this.overallRawScore = props.overallRawScore;
    this.officialScaledScore = props.officialScaledScore;
    this.officialScoreLabel = props.officialScoreLabel;
    this.percentile = props.percentile;
    this.sectionScores = [...props.sectionScores];
    this._status = props.status ?? 'SCORED';
  }

  get status(): 'PENDING' | 'SCORED' | 'PUBLISHED' {
    return this._status;
  }

  public publish(): void {
    this._status = 'PUBLISHED';
    this.addDomainEvent(new ScorePublished(this.id));
  }
}

export class MockReport {
  constructor(
    public readonly id: string,
    public readonly resultId: string,
    public readonly studentId: string,
    public readonly weakAreas: readonly string[],
    public readonly strongAreas: readonly string[],
    public readonly studyRecommendations: readonly string[]
  ) {}
}

export class MockReadiness {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly resultId: string,
    public readonly overallReadinessPct: number,
    public readonly passProbabilityPct: number,
    public readonly recommendedStudyHours: number
  ) {}
}

// ═══════════════════════════════════════════════════════════════════
// 4. RULES ENGINE SUB-SERVICES
// ═══════════════════════════════════════════════════════════════════

export class TimingEngine {
  public isExpired(startedAt: Date, durationMinutes: number): boolean {
    const elapsedMinutes = (Date.now() - startedAt.getTime()) / 60000;
    return elapsedMinutes >= durationMinutes;
  }
  public calculateRemainingSeconds(startedAt: Date, durationMinutes: number): number {
    const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const totalSeconds = durationMinutes * 60;
    return Math.max(0, totalSeconds - elapsedSeconds);
  }
}

export class NavigationEngine {
  public canAccessSection(
    currentIndex: number,
    targetIndex: number,
    lockOnComplete: boolean
  ): boolean {
    if (lockOnComplete && targetIndex < currentIndex) return false;
    return true;
  }
}

export class IntegrityEngine {
  public validateSubmission(attempt: MockAttempt, minAnswers: number): boolean {
    return attempt.answers.length >= minAnswers;
  }
}

export class RecoveryEngine {
  public recoverSession(session: MockSession): void {
    (session as any).addDomainEvent(new SessionRecovered(session.id));
  }
}

export class ExaminationRulesEngine {
  constructor(
    public readonly timing: TimingEngine = new TimingEngine(),
    public readonly navigation: NavigationEngine = new NavigationEngine(),
    public readonly integrity: IntegrityEngine = new IntegrityEngine(),
    public readonly recovery: RecoveryEngine = new RecoveryEngine()
  ) {}
}

// ═══════════════════════════════════════════════════════════════════
// 5. SCORING STRATEGIES & ENGINE
// ═══════════════════════════════════════════════════════════════════

export interface IScoringStrategy {
  calculate(answers: MockAnswerPayload[]): {
    rawScore: number;
    scaledScore: number;
    label: string;
    percentile: number;
  };
}

export class IELTSScoringStrategy implements IScoringStrategy {
  public calculate(answers: MockAnswerPayload[]): {
    rawScore: number;
    scaledScore: number;
    label: string;
    percentile: number;
  } {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = Math.max(1, answers.length);
    const pct = (correct / total) * 100;

    // Convert % to 0–9.0 band scale rounded to nearest 0.5
    let band = Math.round((pct / 100) * 9.0 * 2) / 2;
    band = Math.min(9.0, Math.max(0.0, band));
    const percentile = Math.min(99, Math.round((pct / 100) * 99));

    return { rawScore: pct, scaledScore: band, label: `IELTS Band ${band.toFixed(1)}`, percentile };
  }
}

export class TOEFLScoringStrategy implements IScoringStrategy {
  public calculate(answers: MockAnswerPayload[]): {
    rawScore: number;
    scaledScore: number;
    label: string;
    percentile: number;
  } {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = Math.max(1, answers.length);
    const pct = (correct / total) * 100;
    const scaled = Math.round((pct / 100) * 120);
    const percentile = Math.min(99, Math.round((pct / 100) * 99));
    return { rawScore: pct, scaledScore: scaled, label: `TOEFL ${scaled}/120`, percentile };
  }
}

export class CELPIPScoringStrategy implements IScoringStrategy {
  public calculate(answers: MockAnswerPayload[]): {
    rawScore: number;
    scaledScore: number;
    label: string;
    percentile: number;
  } {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = Math.max(1, answers.length);
    const pct = (correct / total) * 100;
    const level = Math.min(12, Math.max(1, Math.round((pct / 100) * 12)));
    const percentile = Math.min(99, Math.round((pct / 100) * 99));
    return { rawScore: pct, scaledScore: level, label: `CELPIP Level ${level}`, percentile };
  }
}

export class SATScoringStrategy implements IScoringStrategy {
  public calculate(answers: MockAnswerPayload[]): {
    rawScore: number;
    scaledScore: number;
    label: string;
    percentile: number;
  } {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = Math.max(1, answers.length);
    const pct = (correct / total) * 100;
    const scaled = Math.round(400 + (pct / 100) * 1200);
    const percentile = Math.min(99, Math.round((pct / 100) * 99));
    return { rawScore: pct, scaledScore: scaled, label: `SAT ${scaled}/1600`, percentile };
  }
}

export class CustomScoringStrategy implements IScoringStrategy {
  public calculate(answers: MockAnswerPayload[]): {
    rawScore: number;
    scaledScore: number;
    label: string;
    percentile: number;
  } {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = Math.max(1, answers.length);
    const pct = Math.round((correct / total) * 100);
    return { rawScore: pct, scaledScore: pct, label: `${pct}%`, percentile: pct };
  }
}

export class ScoringStrategyResolver {
  public static resolve(strategyCode: string): IScoringStrategy {
    switch (strategyCode.toUpperCase()) {
      case 'IELTS':
        return new IELTSScoringStrategy();
      case 'TOEFL':
        return new TOEFLScoringStrategy();
      case 'CELPIP':
        return new CELPIPScoringStrategy();
      case 'SAT':
        return new SATScoringStrategy();
      default:
        return new CustomScoringStrategy();
    }
  }
}

export class ScoringEngine {
  public scoreAttempt(
    sessionId: string,
    studentId: string,
    strategyCode: string,
    answers: MockAnswerPayload[]
  ): MockResult {
    const strategy = ScoringStrategyResolver.resolve(strategyCode);
    const res = strategy.calculate(answers);

    const result = new MockResult({
      id: randomUUID(),
      sessionId,
      studentId,
      overallRawScore: res.rawScore,
      officialScaledScore: res.scaledScore,
      officialScoreLabel: res.label,
      percentile: res.percentile,
      sectionScores: [],
    });
    (result as any).addDomainEvent(new MockScored(result.id, sessionId, res.label));
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 6. READINESS, REPORTING, ANALYTICS & TEMPLATE BUILDER SERVICES
// ═══════════════════════════════════════════════════════════════════

export class TemplateBuilderService {
  public buildTemplateFromBlueprint(
    blueprint: MockBlueprint,
    sections: MockTemplateSection[]
  ): MockTemplate {
    if (blueprint.status !== 'APPROVED' && blueprint.status !== 'PUBLISHED') {
      throw new Error('Blueprint must be APPROVED to build template');
    }
    const totalDuration = sections.reduce((acc, s) => acc + s.durationMinutes, 0);
    const templateId = randomUUID();

    const template = new MockTemplate({
      id: templateId,
      blueprintId: blueprint.id,
      version: 1,
      totalDurationMinutes: totalDuration,
      passingScore: 70,
      scoringStrategy: blueprint.scoringStrategy,
      sections,
    });
    (template as any).addDomainEvent(new TemplatePublished(templateId, 1));
    return template;
  }
}

export class ReadinessEngine {
  public calculateReadiness(studentId: string, result: MockResult): MockReadiness {
    const readinessPct = Math.min(100, Math.round(result.percentile * 0.9 + 10));
    const passProb = Math.min(99, Math.round(result.overallRawScore * 0.95));
    const studyHours = Math.max(0, Math.round((100 - readinessPct) * 0.5));

    const readiness = new MockReadiness(
      randomUUID(),
      studentId,
      result.id,
      readinessPct,
      passProb,
      studyHours
    );
    return readiness;
  }
}

export class ReportingEngine {
  public generateReport(result: MockResult): MockReport {
    const weakAreas =
      result.overallRawScore < 70 ? ['Grammar', 'Time Management'] : ['Complex Vocabulary'];
    const strongAreas = ['Main Idea Inference', 'Question Velocity'];
    const recommendations = [
      'Complete 3 Adaptive Practice sessions in Grammar',
      'Review Spaced Flashcards',
    ];

    return new MockReport(
      randomUUID(),
      result.id,
      result.studentId,
      weakAreas,
      strongAreas,
      recommendations
    );
  }
}

export class TrendAnalyzer {
  public computeTrend(scores: number[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (scores.length < 2) return 'STABLE';
    const diff = scores[scores.length - 1] - scores[0];
    if (diff > 5) return 'IMPROVING';
    if (diff < -5) return 'DECLINING';
    return 'STABLE';
  }
}

export class VelocityAnalyzer {
  public computeVelocity(scores: number[]): number {
    if (scores.length < 2) return 0;
    return Math.round((scores[scores.length - 1] - scores[0]) / scores.length);
  }
}

export class ConsistencyAnalyzer {
  public computeConsistency(scores: number[]): number {
    if (!scores.length) return 100;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length;
    return Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance))));
  }
}

export class HistoricalAnalyticsEngine {
  constructor(
    public readonly trend: TrendAnalyzer = new TrendAnalyzer(),
    public readonly velocity: VelocityAnalyzer = new VelocityAnalyzer(),
    public readonly consistency: ConsistencyAnalyzer = new ConsistencyAnalyzer()
  ) {}
}

// ═══════════════════════════════════════════════════════════════════
// 7. AI EVALUATION EXTENSION PLACEHOLDERS
// ═══════════════════════════════════════════════════════════════════

export interface IAIWritingEvaluator {
  evaluateEssay(essayText: string): Promise<{ score: number; feedback: string }>;
}

export class MockAIWritingEvaluator implements IAIWritingEvaluator {
  public async evaluateEssay(_essayText: string): Promise<{ score: number; feedback: string }> {
    return { score: 7.5, feedback: 'Strong coherence and cohesive devices.' };
  }
}

export interface IAISpeakingEvaluator {
  evaluateAudio(audioUrl: string): Promise<{ score: number; fluency: number }>;
}

export class MockAISpeakingEvaluator implements IAISpeakingEvaluator {
  public async evaluateAudio(_audioUrl: string): Promise<{ score: number; fluency: number }> {
    return { score: 7.0, fluency: 80 };
  }
}

// ═══════════════════════════════════════════════════════════════════
// CANONICAL MOCK EXAMINATION DELIVERY DOMAIN EXPORTS (Sprint 3.6)
// ═══════════════════════════════════════════════════════════════════
export * from './aggregates/mock-section.aggregate';
export * from './aggregates/mock-checkpoint.aggregate';
export * from './aggregates/subjective-evaluation-queue.aggregate';
export * from './services/integrity-detection.service';
export * from './services/integrity-enforcement.service';
export * from './services/mock-timing.service';
export * from './strategies/submission-strategy';
export * from './strategies/navigation-policy';
export * from './strategies/result-visibility-strategy';
export * from './state-machine/mock-session-delivery.state-machine';
export * from './events/mock-delivery-canonical-events';
export * from './repositories/mock-delivery-canonical-repositories';
