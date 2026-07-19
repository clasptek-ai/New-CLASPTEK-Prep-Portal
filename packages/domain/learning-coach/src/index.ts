import { Entity, AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. DOMAIN EVENTS
// ═══════════════════════════════════════════════════════════════════

export interface CoachDomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseCoachEvent implements CoachDomainEvent {
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

export class CoachCreated extends BaseCoachEvent {
  constructor(coachId: string, studentId: string, profileId: string) {
    super('CoachCreated', coachId, { studentId, profileId });
  }
}

export class StudyPlanGenerated extends BaseCoachEvent {
  constructor(planId: string, coachId: string, planType: string) {
    super('StudyPlanGenerated', planId, { coachId, planType });
  }
}

export class RevisionPlanGenerated extends BaseCoachEvent {
  constructor(planId: string, coachId: string, campaignType: string) {
    super('RevisionPlanGenerated', planId, { coachId, campaignType });
  }
}

export class GoalCreated extends BaseCoachEvent {
  constructor(goalId: string, coachId: string, goalType: string, title: string) {
    super('GoalCreated', goalId, { coachId, goalType, title });
  }
}

export class GoalCompleted extends BaseCoachEvent {
  constructor(goalId: string, coachId: string) {
    super('GoalCompleted', goalId, { coachId });
  }
}

export class GoalFailed extends BaseCoachEvent {
  constructor(goalId: string, coachId: string, reason?: string) {
    super('GoalFailed', goalId, { coachId, reason });
  }
}

export class GoalAtRisk extends BaseCoachEvent {
  constructor(goalId: string, coachId: string, currentValue: number, targetValue: number) {
    super('GoalAtRisk', goalId, { coachId, currentValue, targetValue });
  }
}

export class HabitUpdated extends BaseCoachEvent {
  constructor(trackerId: string, coachId: string, studyMinutes: number) {
    super('HabitUpdated', trackerId, { coachId, studyMinutes });
  }
}

export class ReflectionRecorded extends BaseCoachEvent {
  constructor(journalId: string, coachId: string, mood: string) {
    super('ReflectionRecorded', journalId, { coachId, mood });
  }
}

export class ConversationStarted extends BaseCoachEvent {
  constructor(conversationId: string, coachId: string, topic?: string) {
    super('ConversationStarted', conversationId, { coachId, topic });
  }
}

export class ConversationEnded extends BaseCoachEvent {
  constructor(conversationId: string, coachId: string, messageCount: number) {
    super('ConversationEnded', conversationId, { coachId, messageCount });
  }
}

export class RecommendationGenerated extends BaseCoachEvent {
  constructor(recId: string, coachId: string, type: string, priority: string) {
    super('RecommendationGenerated', recId, { coachId, type, priority });
  }
}

export class MotivationGenerated extends BaseCoachEvent {
  constructor(coachId: string, messageType: string, urgency: string) {
    super('MotivationGenerated', coachId, { messageType, urgency });
  }
}

export class StudyReminderScheduled extends BaseCoachEvent {
  constructor(notificationId: string, coachId: string, scheduledAt: Date) {
    super('StudyReminderScheduled', notificationId, { coachId, scheduledAt });
  }
}

export class RiskAlertGenerated extends BaseCoachEvent {
  constructor(coachId: string, severity: string, category: string) {
    super('RiskAlertGenerated', coachId, { severity, category });
  }
}

export class WeeklyPlanGenerated extends BaseCoachEvent {
  constructor(planId: string, coachId: string, weekStart: Date) {
    super('WeeklyPlanGenerated', planId, { coachId, weekStart });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. ENUMS & UNION TYPES
// ═══════════════════════════════════════════════════════════════════

export type CoachStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type CoachStyleTone = 'ENCOURAGING' | 'DIRECT' | 'ANALYTICAL';
export type CoachStylePacing = 'INTENSIVE' | 'BALANCED' | 'RELAXED';
export type ActiveEngine = 'RULE_BASED' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'OLLAMA';
export type SessionType = 'DAILY_CHECK_IN' | 'WEEKLY_REVIEW' | 'GOAL_SETTING' | 'REVISION_PLANNING' | 'MOTIVATION' | 'REFLECTION' | 'INTERVENTION_FOLLOW_UP' | 'EXAM_PREPARATION';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type PlanType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EXAM_COUNTDOWN';
export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type DailyPlanStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED';

/** RecommendationType — registry driven (Rec 8) */
export type RecommendationType = 'PRACTICE' | 'REVISION' | 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING' | 'VOCABULARY' | 'GRAMMAR' | 'MOCK_EXAM' | 'REST' | 'BREAK' | 'MOTIVATION' | 'REFLECTION' | 'GOAL' | 'RESOURCE';

/** RecommendationPriority (Rec 4) */
export type RecommendationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';

/** GoalStatus — full state machine (Rec 6) */
export type GoalStatus = 'CREATED' | 'ACTIVE' | 'AT_RISK' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';
export type GoalType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EXAM';

export type CampaignType = 'REVISION_A' | 'REVISION_B' | 'MOCK' | 'FINAL_WEEK' | 'EXAM_DAY';
export type ConversationStatus = 'ACTIVE' | 'SUMMARISED' | 'ARCHIVED';
export type MessageRole = 'STUDENT' | 'COACH' | 'SYSTEM';
export type HabitMood = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'TIRED' | 'STRESSED';
export type ReflectionMood = 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';

/** InsightSeverity (Rec 5) */
export type InsightSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type InsightCategory = 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING' | 'VOCABULARY' | 'GRAMMAR' | 'STRATEGY' | 'MOTIVATION' | 'HABIT' | 'GENERAL';

export type NotificationType = 'STUDY_REMINDER' | 'GOAL_DEADLINE' | 'RISK_ALERT' | 'MOTIVATION' | 'ACHIEVEMENT' | 'HABIT_STREAK' | 'WEEKLY_SUMMARY' | 'EXAM_COUNTDOWN';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS' | 'WHATSAPP' | 'CALENDAR';
export type NotificationStatus = 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
export type MotivationArchetype = 'GOAL_DRIVEN' | 'ANXIETY_PRONE' | 'SOCIAL_LEARNER' | 'SELF_DIRECTED' | 'COMPETITIVE' | 'REFLECTIVE';
export type LearningStyle = 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING' | 'MIXED';
export type MotivationStyle = 'ENCOURAGEMENT' | 'CHALLENGE' | 'ANALYTICAL' | 'SOCIAL' | 'AUTONOMY';
export type PromptEngineType = 'COACHING' | 'PLANNING' | 'REVISION' | 'MOTIVATION' | 'REFLECTION' | 'GOAL' | 'CONVERSATION' | 'INSIGHT';

// ═══════════════════════════════════════════════════════════════════
// 3. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class CoachingStyle extends ValueObject<{
  tone: CoachStyleTone;
  pacing: CoachStylePacing;
}> {
  constructor(tone: CoachStyleTone, pacing: CoachStylePacing) {
    super({ tone, pacing });
  }
  get tone(): CoachStyleTone { return this.props.tone; }
  get pacing(): CoachStylePacing { return this.props.pacing; }

  public static default(): CoachingStyle {
    return new CoachingStyle('ENCOURAGING', 'BALANCED');
  }
}

export class StudyTask extends ValueObject<{
  taskType: RecommendationType;
  title: string;
  competencyCode?: string | undefined;
  resourceId?: string | undefined;
  estimatedMinutes: number;
  priority: number;
  description?: string | undefined;
}> {
  constructor(props: {
    taskType: RecommendationType;
    title: string;
    competencyCode?: string | undefined;
    resourceId?: string | undefined;
    estimatedMinutes: number;
    priority?: number;
    description?: string | undefined;
  }) {
    if (!props.title) throw new Error('Task title is required');
    if (props.estimatedMinutes < 0) throw new Error('Estimated minutes cannot be negative');
    const p: {
      taskType: RecommendationType;
      title: string;
      competencyCode?: string | undefined;
      resourceId?: string | undefined;
      estimatedMinutes: number;
      priority: number;
      description?: string | undefined;
    } = {
      taskType: props.taskType,
      title: props.title,
      estimatedMinutes: props.estimatedMinutes,
      priority: props.priority ?? 3
    };
    if (props.competencyCode !== undefined) p.competencyCode = props.competencyCode;
    if (props.resourceId !== undefined) p.resourceId = props.resourceId;
    if (props.description !== undefined) p.description = props.description;
    super(p);
  }
  get taskType(): RecommendationType { return this.props.taskType; }
  get title(): string { return this.props.title; }
  get estimatedMinutes(): number { return this.props.estimatedMinutes; }
  get priority(): number { return this.props.priority; }
  get competencyCode(): string | undefined { return this.props.competencyCode; }
  get resourceId(): string | undefined { return this.props.resourceId; }
  get description(): string | undefined { return this.props.description; }
}

export class GoalTarget extends ValueObject<{
  targetType: GoalType;
  targetValue: number;
  targetUnit: string;
  deadline?: Date | undefined;
}> {
  constructor(props: {
    targetType: GoalType;
    targetValue: number;
    targetUnit: string;
    deadline?: Date | undefined;
  }) {
    const p: { targetType: GoalType; targetValue: number; targetUnit: string; deadline?: Date | undefined } = {
      targetType: props.targetType,
      targetValue: props.targetValue,
      targetUnit: props.targetUnit
    };
    if (props.deadline !== undefined) p.deadline = props.deadline;
    super(p);
  }
  get targetType(): GoalType { return this.props.targetType; }
  get targetValue(): number { return this.props.targetValue; }
  get targetUnit(): string { return this.props.targetUnit; }
  get deadline(): Date | undefined { return this.props.deadline; }
}

export class HabitScore extends ValueObject<{
  streak: number;
  consistencyPercent: number;
  totalMinutes: number;
  focusScore: number;
}> {
  constructor(streak: number, consistencyPercent: number, totalMinutes: number, focusScore: number) {
    if (consistencyPercent < 0 || consistencyPercent > 100) {
      throw new Error('Consistency must be 0-100');
    }
    super({ streak, consistencyPercent, totalMinutes, focusScore });
  }
  get streak(): number { return this.props.streak; }
  get consistencyPercent(): number { return this.props.consistencyPercent; }
  get totalMinutes(): number { return this.props.totalMinutes; }
  get focusScore(): number { return this.props.focusScore; }
}

export class ReflectionEntry extends ValueObject<{
  mood: ReflectionMood;
  difficultyRating: number;
  insights?: string | undefined;
  whatWentWell?: string | undefined;
  whatWasDifficult?: string | undefined;
  nextSessionFocus?: string | undefined;
}> {
  constructor(props: {
    mood: ReflectionMood;
    difficultyRating: number;
    insights?: string | undefined;
    whatWentWell?: string | undefined;
    whatWasDifficult?: string | undefined;
    nextSessionFocus?: string | undefined;
  }) {
    if (props.difficultyRating < 1 || props.difficultyRating > 5) {
      throw new Error('Difficulty rating must be 1-5');
    }
    const p: {
      mood: ReflectionMood;
      difficultyRating: number;
      insights?: string | undefined;
      whatWentWell?: string | undefined;
      whatWasDifficult?: string | undefined;
      nextSessionFocus?: string | undefined;
    } = {
      mood: props.mood,
      difficultyRating: props.difficultyRating
    };
    if (props.insights !== undefined) p.insights = props.insights;
    if (props.whatWentWell !== undefined) p.whatWentWell = props.whatWentWell;
    if (props.whatWasDifficult !== undefined) p.whatWasDifficult = props.whatWasDifficult;
    if (props.nextSessionFocus !== undefined) p.nextSessionFocus = props.nextSessionFocus;
    super(p);
  }
  get mood(): ReflectionMood { return this.props.mood; }
  get difficultyRating(): number { return this.props.difficultyRating; }
  get insights(): string | undefined { return this.props.insights; }
  get whatWentWell(): string | undefined { return this.props.whatWentWell; }
  get whatWasDifficult(): string | undefined { return this.props.whatWasDifficult; }
  get nextSessionFocus(): string | undefined { return this.props.nextSessionFocus; }
}

export class MotivationMessage extends ValueObject<{
  messageType: NotificationType;
  content: string;
  urgency: RecommendationPriority;
}> {
  constructor(messageType: NotificationType, content: string, urgency: RecommendationPriority) {
    if (!content) throw new Error('Motivation message content is required');
    super({ messageType, content, urgency });
  }
  get messageType(): NotificationType { return this.props.messageType; }
  get content(): string { return this.props.content; }
  get urgency(): RecommendationPriority { return this.props.urgency; }
}

export class RevisionCampaign extends ValueObject<{
  campaignType: CampaignType;
  startDate: Date;
  endDate: Date;
  focusAreas: string[];
  examDate?: Date | undefined;
}> {
  constructor(props: {
    campaignType: CampaignType;
    startDate: Date;
    endDate: Date;
    focusAreas: string[];
    examDate?: Date | undefined;
  }) {
    if (props.startDate > props.endDate) {
      throw new Error('Campaign start date cannot be after end date');
    }
    const p: {
      campaignType: CampaignType;
      startDate: Date;
      endDate: Date;
      focusAreas: string[];
      examDate?: Date | undefined;
    } = {
      campaignType: props.campaignType,
      startDate: props.startDate,
      endDate: props.endDate,
      focusAreas: [...props.focusAreas]
    };
    if (props.examDate !== undefined) p.examDate = props.examDate;
    super(p);
  }
  get campaignType(): CampaignType { return this.props.campaignType; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get focusAreas(): string[] { return this.props.focusAreas; }
  get examDate(): Date | undefined { return this.props.examDate; }
}

export class ConversationSummary extends ValueObject<{
  topicsCovered: string[];
  keyInsights: string[];
  followUpActions: string[];
  tokenCount: number;
}> {
  constructor(props: {
    topicsCovered: string[];
    keyInsights: string[];
    followUpActions: string[];
    tokenCount: number;
  }) {
    super({
      topicsCovered: [...props.topicsCovered],
      keyInsights: [...props.keyInsights],
      followUpActions: [...props.followUpActions],
      tokenCount: props.tokenCount
    });
  }
  get topicsCovered(): string[] { return this.props.topicsCovered; }
  get keyInsights(): string[] { return this.props.keyInsights; }
  get followUpActions(): string[] { return this.props.followUpActions; }
  get tokenCount(): number { return this.props.tokenCount; }
}

// ═══════════════════════════════════════════════════════════════════
// 4. LLM PROVIDER INTERFACE (Rec 14) — swappable backend
// ═══════════════════════════════════════════════════════════════════

export interface LLMProvider {
  readonly providerId: string;
  readonly modelId: string;
  generateText(prompt: string, variables: Record<string, string>): Promise<string>;
  generateStructured<T>(prompt: string, variables: Record<string, string>): Promise<T>;
  estimateTokens(text: string): number;
}

/** Mock implementation for Sprint 3.0 (deterministic rule-based) */
export class MockLLMProvider implements LLMProvider {
  public readonly providerId = 'MOCK';
  public readonly modelId = 'rule-based-v1';

  async generateText(prompt: string, variables: Record<string, string>): Promise<string> {
    const filled = Object.entries(variables).reduce((t, [k, v]) => t.replace(`{{${k}}}`, v), prompt);
    return `[Coach] ${filled.substring(0, 200)}`;
  }

  async generateStructured<T>(prompt: string, variables: Record<string, string>): Promise<T> {
    return { generated: true, prompt: prompt.substring(0, 50), variables } as unknown as T;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. COACH AGENT INTERFACE (Rec 15) — future multi-agent readiness
// ═══════════════════════════════════════════════════════════════════

export interface CoachAgent {
  plan(context: CoachingContext): Promise<CoachAgentPlanResult>;
  reflect(context: CoachingContext): Promise<CoachAgentReflectionResult>;
  motivate(context: CoachingContext): Promise<MotivationMessage>;
  recommend(context: CoachingContext): Promise<CoachRecommendation[]>;
  coach(context: CoachingContext): Promise<string>;
}

export interface CoachingContext {
  coachId: string;
  studentId: string;
  profileId: string;
  readinessScore?: number | undefined;
  weakCompetencies?: string[] | undefined;
  studyStreak?: number | undefined;
  daysToExam?: number | undefined;
  recentEvaluationFeedback?: string | undefined;
  practiceStats?: Record<string, any> | undefined;
  coachStyle?: CoachingStyle | undefined;
  coachMemory?: CoachMemory | undefined;
}

export interface CoachAgentPlanResult {
  tasks: StudyTask[];
  focusAreas: string[];
  estimatedMinutes: number;
  generatedByEngine: ActiveEngine;
}

export interface CoachAgentReflectionResult {
  insights: string[];
  followUpActions: string[];
  riskFlags: string[];
}

// ═══════════════════════════════════════════════════════════════════
// 6. DOMAIN SERVICE INTERFACES (Recs 1, 3)
// ═══════════════════════════════════════════════════════════════════

/** StudyPlanningEngine — Rec 3 (separate planning engines) */
export interface StudyPlanningEngine {
  generateDailyTasks(context: CoachingContext): Promise<StudyTask[]>;
  generateWeeklyPlan(context: CoachingContext, startDate: Date): Promise<CoachingPlanData>;
}

/** RevisionPlanningEngine — Rec 3 */
export interface RevisionPlanningEngine {
  generateRevisionPlan(context: CoachingContext, campaign: RevisionCampaign): Promise<RevisionPlanData>;
  generateExamDayChecklist(context: CoachingContext): Promise<StudyTask[]>;
}

/** GoalPlanningEngine — Rec 3 */
export interface GoalPlanningEngine {
  suggestGoals(context: CoachingContext): Promise<GoalSuggestion[]>;
  checkGoalRisk(goal: StudyGoal): GoalStatus;
}

/** ConversationEngine — Rec 1 */
export interface ConversationEngine {
  respond(conversation: CoachConversation, studentMessage: string, context: CoachingContext): Promise<string>;
  summarise(conversation: CoachConversation): Promise<ConversationSummary>;
  extractInsights(conversation: CoachConversation): Promise<ConversationInsight[]>;
}

/** MotivationEngine — Rec 1 */
export interface MotivationEngine {
  generateEncouragement(context: CoachingContext): Promise<MotivationMessage>;
  generateRiskAlert(context: CoachingContext, severity: InsightSeverity): Promise<MotivationMessage>;
  generateAchievement(context: CoachingContext, achievement: string): Promise<MotivationMessage>;
}

export interface CoachingPlanData {
  startDate: Date;
  endDate: Date;
  focusCompetencies: string[];
  tasks: StudyTask[];
}

export interface RevisionPlanData {
  campaign: RevisionCampaign;
  dailyTasks: Map<string, StudyTask[]>;
}

export interface GoalSuggestion {
  goalType: GoalType;
  title: string;
  targetValue: number;
  targetUnit: string;
  deadline?: Date | undefined;
}

// ═══════════════════════════════════════════════════════════════════
// 7. ENTITIES
// ═══════════════════════════════════════════════════════════════════

export class CoachingSession extends Entity<string> {
  public readonly coachId: string;
  public readonly sessionType: SessionType;
  public status: SessionStatus;
  public readonly startedAt: Date;
  public endedAt: Date | undefined;
  public durationSeconds: number | undefined;
  public summary: string | undefined;

  constructor(props: {
    id: string;
    coachId: string;
    sessionType: SessionType;
    status?: SessionStatus;
    startedAt?: Date;
    endedAt?: Date | undefined;
    durationSeconds?: number | undefined;
    summary?: string | undefined;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.sessionType = props.sessionType;
    this.status = props.status ?? 'ACTIVE';
    this.startedAt = props.startedAt ?? new Date();
    if (props.endedAt !== undefined) this.endedAt = props.endedAt;
    if (props.durationSeconds !== undefined) this.durationSeconds = props.durationSeconds;
    if (props.summary !== undefined) this.summary = props.summary;
  }

  public end(summary?: string): void {
    if (this.status !== 'ACTIVE') throw new Error('Can only end an active session');
    this.status = 'COMPLETED';
    this.endedAt = new Date();
    this.durationSeconds = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
    if (summary !== undefined) this.summary = summary;
  }

  public static start(coachId: string, sessionType: SessionType): CoachingSession {
    return new CoachingSession({ id: randomUUID(), coachId, sessionType });
  }
}

export class ConversationMessage extends Entity<string> {
  public readonly conversationId: string;
  public readonly role: MessageRole;
  public readonly content: string;
  public readonly tokenCount: number;
  public readonly metadata: Record<string, any>;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    tokenCount?: number;
    metadata?: Record<string, any>;
    createdAt?: Date;
  }) {
    super(props.id);
    this.conversationId = props.conversationId;
    this.role = props.role;
    this.content = props.content;
    this.tokenCount = props.tokenCount ?? 0;
    this.metadata = props.metadata ?? {};
    this.createdAt = props.createdAt ?? new Date();
  }
}

export class ConversationInsight extends Entity<string> {
  public readonly conversationId: string;
  public readonly coachId: string;
  public readonly category: string;
  public readonly insightText: string;
  public readonly confidence: number;
  public resolved: boolean;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    conversationId: string;
    coachId: string;
    category: string;
    insightText: string;
    confidence?: number;
    resolved?: boolean;
    createdAt?: Date;
  }) {
    super(props.id);
    this.conversationId = props.conversationId;
    this.coachId = props.coachId;
    this.category = props.category;
    this.insightText = props.insightText;
    this.confidence = props.confidence ?? 0.8;
    this.resolved = props.resolved ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }
}

export class MotivationProfile extends Entity<string> {
  public readonly coachId: string;
  public archetype: MotivationArchetype;
  public riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  public preferredFeedback: 'POSITIVE_FIRST' | 'DIRECT' | 'ANALYTICAL' | 'NARRATIVE';
  public milestoneCount: number;
  public lastMilestoneAt: Date | undefined;

  constructor(props: {
    id: string;
    coachId: string;
    archetype?: MotivationArchetype;
    riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
    preferredFeedback?: 'POSITIVE_FIRST' | 'DIRECT' | 'ANALYTICAL' | 'NARRATIVE';
    milestoneCount?: number;
    lastMilestoneAt?: Date | undefined;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.archetype = props.archetype ?? 'GOAL_DRIVEN';
    this.riskTolerance = props.riskTolerance ?? 'MEDIUM';
    this.preferredFeedback = props.preferredFeedback ?? 'POSITIVE_FIRST';
    this.milestoneCount = props.milestoneCount ?? 0;
    if (props.lastMilestoneAt !== undefined) this.lastMilestoneAt = props.lastMilestoneAt;
  }

  public recordMilestone(): void {
    this.milestoneCount += 1;
    this.lastMilestoneAt = new Date();
  }
}

/** CoachInsight — Rec 5 (persistent cross-session insight) */
export class CoachInsight extends Entity<string> {
  public readonly coachId: string;
  public readonly category: InsightCategory;
  public readonly severity: InsightSeverity;
  public readonly confidence: number;
  public readonly insightText: string;
  public readonly createdFromPredictionId: string | undefined;
  public readonly createdFromEvaluationId: string | undefined;
  public resolved: boolean;
  public archived: boolean;
  public resolvedAt: Date | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    category: InsightCategory;
    severity: InsightSeverity;
    confidence: number;
    insightText: string;
    createdFromPredictionId?: string | undefined;
    createdFromEvaluationId?: string | undefined;
    resolved?: boolean;
    archived?: boolean;
    resolvedAt?: Date | undefined;
    createdAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.category = props.category;
    this.severity = props.severity;
    this.confidence = props.confidence;
    this.insightText = props.insightText;
    if (props.createdFromPredictionId !== undefined) this.createdFromPredictionId = props.createdFromPredictionId;
    if (props.createdFromEvaluationId !== undefined) this.createdFromEvaluationId = props.createdFromEvaluationId;
    this.resolved = props.resolved ?? false;
    this.archived = props.archived ?? false;
    if (props.resolvedAt !== undefined) this.resolvedAt = props.resolvedAt;
    this.createdAt = props.createdAt ?? new Date();
  }

  public resolve(): void {
    this.resolved = true;
    this.resolvedAt = new Date();
  }

  public archive(): void {
    this.archived = true;
  }

  public static create(props: {
    coachId: string;
    category: InsightCategory;
    severity: InsightSeverity;
    confidence: number;
    insightText: string;
    createdFromPredictionId?: string | undefined;
    createdFromEvaluationId?: string | undefined;
  }): CoachInsight {
    return new CoachInsight({ id: randomUUID(), ...props });
  }
}

/** CoachRecommendation — registry-driven types (Rec 8) with priority (Rec 4) */
export class CoachRecommendation extends Entity<string> {
  public readonly coachId: string;
  public readonly sessionId: string | undefined;
  public readonly recommendationType: RecommendationType;
  public readonly priority: RecommendationPriority;
  public readonly title: string;
  public readonly description: string | undefined;
  public readonly resourceId: string | undefined;
  public readonly competencyCode: string | undefined;
  public status: 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED' | 'DISMISSED';
  public readonly expiresAt: Date | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    sessionId?: string | undefined;
    recommendationType: RecommendationType;
    priority: RecommendationPriority;
    title: string;
    description?: string | undefined;
    resourceId?: string | undefined;
    competencyCode?: string | undefined;
    status?: 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED' | 'DISMISSED';
    expiresAt?: Date | undefined;
    createdAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    if (props.sessionId !== undefined) this.sessionId = props.sessionId;
    this.recommendationType = props.recommendationType;
    this.priority = props.priority;
    this.title = props.title;
    if (props.description !== undefined) this.description = props.description;
    if (props.resourceId !== undefined) this.resourceId = props.resourceId;
    if (props.competencyCode !== undefined) this.competencyCode = props.competencyCode;
    this.status = props.status ?? 'PENDING';
    if (props.expiresAt !== undefined) this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static create(props: {
    coachId: string;
    recommendationType: RecommendationType;
    priority: RecommendationPriority;
    title: string;
    description?: string | undefined;
    resourceId?: string | undefined;
    competencyCode?: string | undefined;
    sessionId?: string | undefined;
  }): CoachRecommendation {
    return new CoachRecommendation({ id: randomUUID(), ...props });
  }
}

/** CoachNotification — notification queue (Rec 9) */
export class CoachNotification extends Entity<string> {
  public readonly coachId: string;
  public readonly notificationType: NotificationType;
  public readonly channel: NotificationChannel;
  public status: NotificationStatus;
  public readonly title: string;
  public readonly body: string;
  public readonly metadata: Record<string, any>;
  public readonly scheduledAt: Date;
  public deliveredAt: Date | undefined;
  public retryCount: number;
  public readonly maxRetries: number;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    notificationType: NotificationType;
    channel: NotificationChannel;
    status?: NotificationStatus;
    title: string;
    body: string;
    metadata?: Record<string, any>;
    scheduledAt: Date;
    deliveredAt?: Date | undefined;
    retryCount?: number;
    maxRetries?: number;
    createdAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.notificationType = props.notificationType;
    this.channel = props.channel;
    this.status = props.status ?? 'SCHEDULED';
    this.title = props.title;
    this.body = props.body;
    this.metadata = props.metadata ?? {};
    this.scheduledAt = props.scheduledAt;
    if (props.deliveredAt !== undefined) this.deliveredAt = props.deliveredAt;
    this.retryCount = props.retryCount ?? 0;
    this.maxRetries = props.maxRetries ?? 3;
    this.createdAt = props.createdAt ?? new Date();
  }

  public markSent(): void {
    this.status = 'SENT';
    this.deliveredAt = new Date();
  }

  public markFailed(): void {
    this.retryCount += 1;
    if (this.retryCount >= this.maxRetries) {
      this.status = 'FAILED';
    }
  }

  public static schedule(props: {
    coachId: string;
    notificationType: NotificationType;
    channel: NotificationChannel;
    title: string;
    body: string;
    scheduledAt: Date;
    metadata?: Record<string, any>;
  }): CoachNotification {
    return new CoachNotification({ id: randomUUID(), ...props });
  }
}

/** CoachDashboardProjection — pre-computed (Rec 10) */
export class CoachDashboardProjection extends Entity<string> {
  public readonly coachId: string;
  public todayTasks: Record<string, any>[];
  public goalSummary: { active: number; completed: number; atRisk: number; failed: number };
  public habitSummary: { streak: number; consistency: number; todayStudied: boolean };
  public latestMotivation: Record<string, any>;
  public criticalInsights: Record<string, any>[];
  public predictionSummary: Record<string, any>;
  public lastComputedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    todayTasks?: Record<string, any>[];
    goalSummary?: { active: number; completed: number; atRisk: number; failed: number };
    habitSummary?: { streak: number; consistency: number; todayStudied: boolean };
    latestMotivation?: Record<string, any>;
    criticalInsights?: Record<string, any>[];
    predictionSummary?: Record<string, any>;
    lastComputedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.todayTasks = props.todayTasks ?? [];
    this.goalSummary = props.goalSummary ?? { active: 0, completed: 0, atRisk: 0, failed: 0 };
    this.habitSummary = props.habitSummary ?? { streak: 0, consistency: 0, todayStudied: false };
    this.latestMotivation = props.latestMotivation ?? {};
    this.criticalInsights = props.criticalInsights ?? [];
    this.predictionSummary = props.predictionSummary ?? {};
    this.lastComputedAt = props.lastComputedAt ?? new Date();
  }

  public static createEmpty(coachId: string): CoachDashboardProjection {
    return new CoachDashboardProjection({ id: randomUUID(), coachId });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 8. AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════

/**
 * LearningCoach — small, lightweight aggregate root (Rec 1).
 * All intelligence lives in CoachBrain; this just owns identity/status.
 */
export class LearningCoach extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly profileId: string;
  public status: CoachStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    profileId: string;
    status?: CoachStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.profileId = props.profileId;
    this.status = props.status ?? 'ACTIVE';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public suspend(): void {
    if (this.status !== 'ACTIVE') throw new Error('Coach must be active to suspend');
    this.status = 'SUSPENDED';
    this.updatedAt = new Date();
  }

  public activate(): void {
    if (this.status === 'ARCHIVED') throw new Error('Archived coach cannot be re-activated');
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  public static create(props: { studentId: string; profileId: string }): LearningCoach {
    return new LearningCoach({ id: randomUUID(), ...props });
  }
}

/**
 * CoachBrain — separated "intelligent" aggregate (Rec 1).
 * Owns coaching style, active engine, prompt version, and delegates to domain services.
 */
export class CoachBrain extends AggregateRoot<string> {
  public readonly coachId: string;
  public style: CoachingStyle;
  public activeEngine: ActiveEngine;
  public llmModelId: string | undefined;
  public promptVersion: string;
  public lastActiveAt: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    style?: CoachingStyle;
    activeEngine?: ActiveEngine;
    llmModelId?: string | undefined;
    promptVersion?: string;
    lastActiveAt?: Date | undefined;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.style = props.style ?? CoachingStyle.default();
    this.activeEngine = props.activeEngine ?? 'RULE_BASED';
    if (props.llmModelId !== undefined) this.llmModelId = props.llmModelId;
    this.promptVersion = props.promptVersion ?? 'v1.0.0';
    if (props.lastActiveAt !== undefined) this.lastActiveAt = props.lastActiveAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public updateStyle(style: CoachingStyle): void {
    this.style = style;
    this.updatedAt = new Date();
  }

  public switchEngine(engine: ActiveEngine, modelId?: string): void {
    this.activeEngine = engine;
    if (modelId !== undefined) this.llmModelId = modelId;
    this.lastActiveAt = new Date();
    this.updatedAt = new Date();
  }

  public static create(coachId: string, style?: CoachingStyle): CoachBrain {
    return new CoachBrain({ id: randomUUID(), coachId, ...(style !== undefined ? { style } : {}) });
  }
}

/**
 * CoachMemory — long-term learner memory (Rec 2).
 */
export class CoachMemory extends AggregateRoot<string> {
  public readonly coachId: string;
  public preferredStudyHours: Array<{ hour: number; day: string }>;
  public preferredLearningStyle: LearningStyle;
  public preferredMotivationStyle: MotivationStyle;
  public recurringMistakes: string[];
  public strongestSubjects: string[];
  public weakestCompetencies: string[];
  public recurringQuestions: string[];
  public keyMilestones: string[];
  public notes: string | undefined;
  public version: number;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    preferredStudyHours?: Array<{ hour: number; day: string }>;
    preferredLearningStyle?: LearningStyle;
    preferredMotivationStyle?: MotivationStyle;
    recurringMistakes?: string[];
    strongestSubjects?: string[];
    weakestCompetencies?: string[];
    recurringQuestions?: string[];
    keyMilestones?: string[];
    notes?: string | undefined;
    version?: number;
    updatedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.preferredStudyHours = props.preferredStudyHours ?? [];
    this.preferredLearningStyle = props.preferredLearningStyle ?? 'MIXED';
    this.preferredMotivationStyle = props.preferredMotivationStyle ?? 'ENCOURAGEMENT';
    this.recurringMistakes = props.recurringMistakes ?? [];
    this.strongestSubjects = props.strongestSubjects ?? [];
    this.weakestCompetencies = props.weakestCompetencies ?? [];
    this.recurringQuestions = props.recurringQuestions ?? [];
    this.keyMilestones = props.keyMilestones ?? [];
    if (props.notes !== undefined) this.notes = props.notes;
    this.version = props.version ?? 1;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public recordMistake(mistake: string): void {
    if (!this.recurringMistakes.includes(mistake)) {
      this.recurringMistakes.push(mistake);
      this.bumpVersion();
    }
  }

  public recordMilestone(milestone: string): void {
    this.keyMilestones.push(milestone);
    this.bumpVersion();
  }

  public updateWeakCompetencies(competencies: string[]): void {
    this.weakestCompetencies = [...competencies];
    this.bumpVersion();
  }

  public updateStrongestSubjects(subjects: string[]): void {
    this.strongestSubjects = [...subjects];
    this.bumpVersion();
  }

  private bumpVersion(): void {
    this.version += 1;
    this.updatedAt = new Date();
  }

  public static create(coachId: string): CoachMemory {
    return new CoachMemory({ id: randomUUID(), coachId });
  }
}

/**
 * StudyGoal — with full state machine (Rec 6).
 */
export class StudyGoal extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly goalType: GoalType;
  public status: GoalStatus;
  public readonly title: string;
  public readonly description: string | undefined;
  public readonly target: GoalTarget;
  public currentValue: number;
  public completedAt: Date | undefined;
  public failedAt: Date | undefined;
  public pausedAt: Date | undefined;
  public pausedReason: string | undefined;
  public riskDetectedAt: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    goalType: GoalType;
    status?: GoalStatus;
    title: string;
    description?: string | undefined;
    target: GoalTarget;
    currentValue?: number;
    completedAt?: Date | undefined;
    failedAt?: Date | undefined;
    pausedAt?: Date | undefined;
    pausedReason?: string | undefined;
    riskDetectedAt?: Date | undefined;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.goalType = props.goalType;
    this.status = props.status ?? 'CREATED';
    this.title = props.title;
    if (props.description !== undefined) this.description = props.description;
    this.target = props.target;
    this.currentValue = props.currentValue ?? 0;
    if (props.completedAt !== undefined) this.completedAt = props.completedAt;
    if (props.failedAt !== undefined) this.failedAt = props.failedAt;
    if (props.pausedAt !== undefined) this.pausedAt = props.pausedAt;
    if (props.pausedReason !== undefined) this.pausedReason = props.pausedReason;
    if (props.riskDetectedAt !== undefined) this.riskDetectedAt = props.riskDetectedAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public activate(): void {
    if (this.status !== 'CREATED' && this.status !== 'PAUSED') {
      throw new Error(`Goal cannot be activated from status: ${this.status}`);
    }
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  public updateProgress(newValue: number): void {
    if (this.status !== 'ACTIVE' && this.status !== 'AT_RISK') {
      throw new Error('Can only update progress on active or at-risk goals');
    }
    this.currentValue = newValue;
    this.updatedAt = new Date();
  }

  public markAtRisk(): void {
    if (this.status !== 'ACTIVE') throw new Error('Goal must be active to mark at risk');
    this.status = 'AT_RISK';
    this.riskDetectedAt = new Date();
    this.updatedAt = new Date();
  }

  public pause(reason?: string): void {
    if (this.status !== 'ACTIVE' && this.status !== 'AT_RISK') {
      throw new Error('Goal must be active or at-risk to pause');
    }
    this.status = 'PAUSED';
    this.pausedAt = new Date();
    if (reason !== undefined) this.pausedReason = reason;
    this.updatedAt = new Date();
  }

  public complete(): void {
    if (this.status === 'COMPLETED') throw new Error('Goal already completed');
    if (this.status === 'ARCHIVED') throw new Error('Archived goal cannot be completed');
    this.status = 'COMPLETED';
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  public fail(): void {
    if (this.status === 'COMPLETED') throw new Error('Completed goal cannot be marked failed');
    this.status = 'FAILED';
    this.failedAt = new Date();
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  public get progressPercent(): number {
    if (this.target.targetValue <= 0) return 0;
    return Math.min(100, Math.round((this.currentValue / this.target.targetValue) * 100));
  }

  public static create(props: {
    coachId: string;
    goalType: GoalType;
    title: string;
    target: GoalTarget;
    description?: string | undefined;
  }): StudyGoal {
    return new StudyGoal({ id: randomUUID(), ...props });
  }
}

/**
 * CoachConversation — conversation aggregate (Rec 11).
 * Contains messages, summaries, memory, insights.
 */
export class CoachConversation extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly sessionId: string | undefined;
  public topic: string | undefined;
  public status: ConversationStatus;
  public messageCount: number;
  public totalTokens: number;
  public readonly startedAt: Date;
  public endedAt: Date | undefined;
  public archivedAt: Date | undefined;
  public readonly createdAt: Date;

  private _messages: ConversationMessage[] = [];
  private _summary: ConversationSummary | undefined;
  private _insights: ConversationInsight[] = [];

  constructor(props: {
    id: string;
    coachId: string;
    sessionId?: string | undefined;
    topic?: string | undefined;
    status?: ConversationStatus;
    messageCount?: number;
    totalTokens?: number;
    startedAt?: Date;
    endedAt?: Date | undefined;
    archivedAt?: Date | undefined;
    createdAt?: Date;
    messages?: ConversationMessage[];
    summary?: ConversationSummary | undefined;
    insights?: ConversationInsight[];
  }) {
    super(props.id);
    this.coachId = props.coachId;
    if (props.sessionId !== undefined) this.sessionId = props.sessionId;
    if (props.topic !== undefined) this.topic = props.topic;
    this.status = props.status ?? 'ACTIVE';
    this.messageCount = props.messageCount ?? 0;
    this.totalTokens = props.totalTokens ?? 0;
    this.startedAt = props.startedAt ?? new Date();
    if (props.endedAt !== undefined) this.endedAt = props.endedAt;
    if (props.archivedAt !== undefined) this.archivedAt = props.archivedAt;
    this.createdAt = props.createdAt ?? new Date();
    this._messages = props.messages ?? [];
    if (props.summary !== undefined) this._summary = props.summary;
    this._insights = props.insights ?? [];
  }

  public get messages(): ConversationMessage[] { return [...this._messages]; }
  public get summary(): ConversationSummary | undefined { return this._summary; }
  public get insights(): ConversationInsight[] { return [...this._insights]; }

  public addMessage(role: MessageRole, content: string, tokenCount?: number): ConversationMessage {
    if (this.status !== 'ACTIVE') throw new Error('Cannot add messages to a non-active conversation');
    const msg = new ConversationMessage({
      id: randomUUID(),
      conversationId: this.id,
      role,
      content,
      tokenCount: tokenCount ?? 0
    });
    this._messages.push(msg);
    this.messageCount += 1;
    this.totalTokens += msg.tokenCount;
    return msg;
  }

  public summarise(summary: ConversationSummary): void {
    this._summary = summary;
    this.status = 'SUMMARISED';
    this.endedAt = new Date();
  }

  public addInsight(insight: ConversationInsight): void {
    this._insights.push(insight);
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.archivedAt = new Date();
  }

  public static start(coachId: string, topic?: string, sessionId?: string): CoachConversation {
    return new CoachConversation({ id: randomUUID(), coachId, topic, sessionId });
  }
}

/**
 * CoachingPlan — strategic plan aggregate.
 */
export class CoachingPlan extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly planType: PlanType;
  public status: PlanStatus;
  public readonly snapshotId: string | undefined;
  public readonly predictionScore: number | undefined;
  public readonly startDate: Date;
  public readonly endDate: Date;
  public focusCompetencies: string[];
  public priorityAreas: string[];
  public readonly generatedByEngine: ActiveEngine;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    planType: PlanType;
    status?: PlanStatus;
    snapshotId?: string | undefined;
    predictionScore?: number | undefined;
    startDate: Date;
    endDate: Date;
    focusCompetencies?: string[];
    priorityAreas?: string[];
    generatedByEngine?: ActiveEngine;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.planType = props.planType;
    this.status = props.status ?? 'DRAFT';
    if (props.snapshotId !== undefined) this.snapshotId = props.snapshotId;
    if (props.predictionScore !== undefined) this.predictionScore = props.predictionScore;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.focusCompetencies = props.focusCompetencies ?? [];
    this.priorityAreas = props.priorityAreas ?? [];
    this.generatedByEngine = props.generatedByEngine ?? 'RULE_BASED';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public activate(): void {
    if (this.status !== 'DRAFT') throw new Error('Only draft plans can be activated');
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  public complete(): void {
    this.status = 'COMPLETED';
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  public static create(props: {
    coachId: string;
    planType: PlanType;
    startDate: Date;
    endDate: Date;
    focusCompetencies?: string[];
    priorityAreas?: string[];
    snapshotId?: string | undefined;
    predictionScore?: number | undefined;
    generatedByEngine?: ActiveEngine;
  }): CoachingPlan {
    return new CoachingPlan({ id: randomUUID(), ...props });
  }
}

/**
 * DailyStudyPlan — day-level plan aggregate.
 */
export class DailyStudyPlan extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly coachingPlanId: string | undefined;
  public readonly planDate: Date;
  public status: DailyPlanStatus;
  public totalMinutes: number;
  public completedMinutes: number;
  public completionRate: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private _tasks: StudyPlanTask[] = [];

  constructor(props: {
    id: string;
    coachId: string;
    coachingPlanId?: string | undefined;
    planDate: Date;
    status?: DailyPlanStatus;
    totalMinutes?: number;
    completedMinutes?: number;
    completionRate?: number;
    createdAt?: Date;
    updatedAt?: Date;
    tasks?: StudyPlanTask[];
  }) {
    super(props.id);
    this.coachId = props.coachId;
    if (props.coachingPlanId !== undefined) this.coachingPlanId = props.coachingPlanId;
    this.planDate = props.planDate;
    this.status = props.status ?? 'PENDING';
    this.totalMinutes = props.totalMinutes ?? 60;
    this.completedMinutes = props.completedMinutes ?? 0;
    this.completionRate = props.completionRate ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this._tasks = props.tasks ?? [];
  }

  public get tasks(): StudyPlanTask[] { return [...this._tasks]; }

  public addTask(task: StudyPlanTask): void {
    this._tasks.push(task);
    this.totalMinutes = this._tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    this.updatedAt = new Date();
  }

  public checkOffTask(taskId: string): void {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found in plan`);
    task.complete();
    this.completedMinutes = this._tasks
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);
    this.completionRate = this.totalMinutes > 0
      ? Math.round((this.completedMinutes / this.totalMinutes) * 100) / 100
      : 0;
    if (this.completionRate >= 1.0) this.status = 'COMPLETED';
    else if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    this.updatedAt = new Date();
  }

  public static generate(coachId: string, planDate: Date, coachingPlanId?: string): DailyStudyPlan {
    return new DailyStudyPlan({ id: randomUUID(), coachId, planDate, coachingPlanId });
  }
}

export class StudyPlanTask extends Entity<string> {
  public readonly dailyPlanId: string;
  public readonly taskType: RecommendationType;
  public readonly competencyCode: string | undefined;
  public readonly resourceId: string | undefined;
  public readonly title: string;
  public readonly description: string | undefined;
  public readonly estimatedMinutes: number;
  public readonly priority: number;
  public status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  public completedAt: Date | undefined;
  public readonly sortOrder: number;

  constructor(props: {
    id: string;
    dailyPlanId: string;
    taskType: RecommendationType;
    title: string;
    competencyCode?: string | undefined;
    resourceId?: string | undefined;
    description?: string | undefined;
    estimatedMinutes?: number;
    priority?: number;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    completedAt?: Date | undefined;
    sortOrder?: number;
  }) {
    super(props.id);
    this.dailyPlanId = props.dailyPlanId;
    this.taskType = props.taskType;
    this.title = props.title;
    if (props.competencyCode !== undefined) this.competencyCode = props.competencyCode;
    if (props.resourceId !== undefined) this.resourceId = props.resourceId;
    if (props.description !== undefined) this.description = props.description;
    this.estimatedMinutes = props.estimatedMinutes ?? 20;
    this.priority = props.priority ?? 3;
    this.status = props.status ?? 'PENDING';
    if (props.completedAt !== undefined) this.completedAt = props.completedAt;
    this.sortOrder = props.sortOrder ?? 0;
  }

  public complete(): void {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
  }
}

/**
 * HabitTracker — daily check-in aggregate.
 */
export class HabitTracker extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly habitDate: Date;
  public studied: boolean;
  public studyMinutes: number;
  public sessionCount: number;
  public focusScore: number | undefined;
  public mood: HabitMood | undefined;
  public notes: string | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    habitDate: Date;
    studied?: boolean;
    studyMinutes?: number;
    sessionCount?: number;
    focusScore?: number | undefined;
    mood?: HabitMood | undefined;
    notes?: string | undefined;
    createdAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.habitDate = props.habitDate;
    this.studied = props.studied ?? false;
    this.studyMinutes = props.studyMinutes ?? 0;
    this.sessionCount = props.sessionCount ?? 0;
    if (props.focusScore !== undefined) this.focusScore = props.focusScore;
    if (props.mood !== undefined) this.mood = props.mood;
    if (props.notes !== undefined) this.notes = props.notes;
    this.createdAt = props.createdAt ?? new Date();
  }

  public recordStudy(minutes: number, focusScore?: number): void {
    this.studied = true;
    this.studyMinutes += minutes;
    this.sessionCount += 1;
    if (focusScore !== undefined) this.focusScore = focusScore;
  }

  public setMood(mood: HabitMood): void {
    this.mood = mood;
  }

  public static createForDate(coachId: string, date: Date): HabitTracker {
    return new HabitTracker({ id: randomUUID(), coachId, habitDate: date });
  }
}

/**
 * HabitAnalytics — pre-computed habit statistics (Rec 7).
 */
export class HabitAnalytics extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly periodType: 'WEEKLY' | 'MONTHLY';
  public readonly periodStart: Date;
  public readonly periodEnd: Date;
  public currentStreak: number;
  public longestStreak: number;
  public weeklyConsistency: number;
  public monthlyConsistency: number;
  public avgSessionMinutes: number;
  public bestStudyHour: number | undefined;
  public worstStudyHour: number | undefined;
  public studyVelocity: number;
  public computedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    periodType: 'WEEKLY' | 'MONTHLY';
    periodStart: Date;
    periodEnd: Date;
    currentStreak?: number;
    longestStreak?: number;
    weeklyConsistency?: number;
    monthlyConsistency?: number;
    avgSessionMinutes?: number;
    bestStudyHour?: number | undefined;
    worstStudyHour?: number | undefined;
    studyVelocity?: number;
    computedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.periodType = props.periodType;
    this.periodStart = props.periodStart;
    this.periodEnd = props.periodEnd;
    this.currentStreak = props.currentStreak ?? 0;
    this.longestStreak = props.longestStreak ?? 0;
    this.weeklyConsistency = props.weeklyConsistency ?? 0;
    this.monthlyConsistency = props.monthlyConsistency ?? 0;
    this.avgSessionMinutes = props.avgSessionMinutes ?? 0;
    if (props.bestStudyHour !== undefined) this.bestStudyHour = props.bestStudyHour;
    if (props.worstStudyHour !== undefined) this.worstStudyHour = props.worstStudyHour;
    this.studyVelocity = props.studyVelocity ?? 0;
    this.computedAt = props.computedAt ?? new Date();
  }

  public static create(props: {
    coachId: string;
    periodType: 'WEEKLY' | 'MONTHLY';
    periodStart: Date;
    periodEnd: Date;
  }): HabitAnalytics {
    return new HabitAnalytics({ id: randomUUID(), ...props });
  }
}

/** ReflectionJournal — aggregate */
export class ReflectionJournal extends AggregateRoot<string> {
  public readonly coachId: string;
  public readonly sessionId: string | undefined;
  public readonly entry: ReflectionEntry;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    sessionId?: string | undefined;
    entry: ReflectionEntry;
    recordedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    if (props.sessionId !== undefined) this.sessionId = props.sessionId;
    this.entry = props.entry;
    this.recordedAt = props.recordedAt ?? new Date();
  }

  public static record(props: {
    coachId: string;
    entry: ReflectionEntry;
    sessionId?: string | undefined;
  }): ReflectionJournal {
    return new ReflectionJournal({ id: randomUUID(), ...props });
  }
}

/** RevisionPlan — entity (managed within CoachingPlan) */
export class RevisionPlan extends Entity<string> {
  public readonly coachId: string;
  public readonly campaign: RevisionCampaign;
  public status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    coachId: string;
    campaign: RevisionCampaign;
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id);
    this.coachId = props.coachId;
    this.campaign = props.campaign;
    this.status = props.status ?? 'DRAFT';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  public static create(coachId: string, campaign: RevisionCampaign): RevisionPlan {
    return new RevisionPlan({ id: randomUUID(), coachId, campaign });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 9. RULE-BASED ENGINE IMPLEMENTATIONS (Sprint 3.0 stubs)
// ═══════════════════════════════════════════════════════════════════

export class RuleBasedStudyPlanningEngine implements StudyPlanningEngine {
  async generateDailyTasks(context: CoachingContext): Promise<StudyTask[]> {
    const tasks: StudyTask[] = [];
    if (context.weakCompetencies && context.weakCompetencies.length > 0) {
      tasks.push(new StudyTask({
        taskType: 'PRACTICE',
        title: `Practice ${context.weakCompetencies[0]}`,
        competencyCode: context.weakCompetencies[0],
        estimatedMinutes: 30,
        priority: 1
      }));
    }
    tasks.push(new StudyTask({
      taskType: 'REVISION',
      title: 'Daily Vocabulary Review',
      estimatedMinutes: 15,
      priority: 2
    }));
    tasks.push(new StudyTask({
      taskType: 'REFLECTION',
      title: 'Evening Reflection',
      estimatedMinutes: 10,
      priority: 3
    }));
    return tasks;
  }

  async generateWeeklyPlan(context: CoachingContext, startDate: Date): Promise<CoachingPlanData> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const tasks = await this.generateDailyTasks(context);
    return {
      startDate,
      endDate,
      focusCompetencies: context.weakCompetencies ?? [],
      tasks
    };
  }
}

export class RuleBasedMotivationEngine implements MotivationEngine {
  async generateEncouragement(context: CoachingContext): Promise<MotivationMessage> {
    const streak = context.studyStreak ?? 0;
    const content = streak > 0
      ? `Great work maintaining your ${streak}-day streak! Keep it up!`
      : 'Every expert was once a beginner. Start your streak today!';
    return new MotivationMessage('MOTIVATION', content, 'LOW');
  }

  async generateRiskAlert(context: CoachingContext, severity: InsightSeverity): Promise<MotivationMessage> {
    const days = context.daysToExam ?? 0;
    const urgency: RecommendationPriority = severity === 'CRITICAL' ? 'CRITICAL' : severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    return new MotivationMessage(
      'RISK_ALERT',
      `Your readiness score needs attention. With ${days} days to your exam, now is the time to focus.`,
      urgency
    );
  }

  async generateAchievement(_context: CoachingContext, achievement: string): Promise<MotivationMessage> {
    return new MotivationMessage('ACHIEVEMENT', `Congratulations! You achieved: ${achievement}`, 'LOW');
  }
}
