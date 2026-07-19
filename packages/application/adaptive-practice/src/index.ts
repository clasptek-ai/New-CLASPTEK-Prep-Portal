import {
  PracticeSession,
  PracticePlan,
  PracticeRecommendation,
  PracticeStrategy,
  PracticeFeedback,
  AdaptiveSnapshot,
  QuestionSelectionRule,
  CompetencyCoverage,
  SelectionWeight,
  CoveragePercentage,
  SpacingPolicy,
  RecommendationPriority,
  type Priority,
} from '@clasptek/domain-adaptive-practice';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY CONTRACTS (Rec 13)
// ═══════════════════════════════════════════════════════════════════

export interface PracticeSessionRepository {
  save(session: PracticeSession): Promise<void>;
  findById(id: string): Promise<PracticeSession | null>;
  findActive(studentId: string): Promise<PracticeSession | null>;
  search(filters: { studentId?: string | undefined; status?: string | undefined; limit?: number | undefined; offset?: number | undefined }): Promise<PracticeSession[]>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  nextIdentity(): string;
}

export interface PracticePlanRepository {
  save(plan: PracticePlan): Promise<void>;
  findById(id: string): Promise<PracticePlan | null>;
  findByStudent(studentId: string): Promise<PracticePlan[]>;
  nextIdentity(): string;
}

export interface RecommendationRepository {
  save(recommendation: PracticeRecommendation): Promise<void>;
  findById(id: string): Promise<PracticeRecommendation | null>;
  findPending(studentId: string): Promise<PracticeRecommendation[]>;
  accept(id: string, planId: string): Promise<void>;
  reject(id: string): Promise<void>;
  expire(id: string): Promise<void>;
  nextIdentity(): string;
}

export interface StrategyRepository {
  findByCode(code: string): Promise<PracticeStrategy | null>;
  findAll(): Promise<PracticeStrategy[]>;
  save(strategy: PracticeStrategy): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. QUESTION ELIGIBILITY ENGINE (Rec 9, 10, 11)
// ═══════════════════════════════════════════════════════════════════

export interface AttemptLog {
  questionVersionId: string;
  answeredAt: Date;
  wasCorrect: boolean;
  wasSkipped: boolean;
}

export class QuestionEligibilityEngine {
  /**
   * Filter questions based on eligibility rules:
   * - Must be Published & Not Archived
   * - Must be within target difficulty range
   * - Must match target competencies
   * - Must satisfy spacing policy cooldown intervals (Rec 10, 11)
   */
  public filterEligible(
    questions: any[], // Question Bank versions containing title, payload, status
    attempts: AttemptLog[],
    config: {
      minDifficulty: string;
      maxDifficulty: string;
      targetCompetencies: string[];
      cooldownRules: { correctDays: number; incorrectHours: number; skippedHours: number };
    },
    now: Date = new Date()
  ): any[] {
    return questions.filter(q => {
      // 1. Status Check
      if (q.status !== 'PUBLISHED') return false;

      // 2. Difficulty Boundaries Check
      const diff = q.payload?.difficulty || 'Beginner';
      // Basic order mapping for difficulty boundary checks
      const levels = ['Beginner', 'Intermediate', 'Advanced'];
      const qIndex = levels.indexOf(diff);
      const minIndex = levels.indexOf(config.minDifficulty);
      const maxIndex = levels.indexOf(config.maxDifficulty);
      if (minIndex !== -1 && qIndex < minIndex) return false;
      if (maxIndex !== -1 && qIndex > maxIndex) return false;

      // 3. Competency Mapping Match
      const qCompetencies: string[] = q.payload?.competencies || [];
      const matchesCompetency = config.targetCompetencies.length === 0 ||
        qCompetencies.some(cId => config.targetCompetencies.includes(cId));
      if (!matchesCompetency) return false;

      // 4. Spacing Cooldown Checks (Rec 10)
      const lastAttempt = attempts
        .filter(a => a.questionVersionId === q.id)
        .sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime())[0];

      if (lastAttempt) {
        let cooldownMs = 0;
        if (lastAttempt.wasSkipped) {
          cooldownMs = config.cooldownRules.skippedHours * 60 * 60 * 1000;
        } else if (lastAttempt.wasCorrect) {
          cooldownMs = config.cooldownRules.correctDays * 24 * 60 * 60 * 1000;
        } else {
          cooldownMs = config.cooldownRules.incorrectHours * 60 * 60 * 1000;
        }

        const elapsedMs = now.getTime() - lastAttempt.answeredAt.getTime();
        if (elapsedMs < cooldownMs) {
          return false;
        }
      }

      return true;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. PLUGGABLE SELECTION STRATEGIES (Rec 2, 8)
// ═══════════════════════════════════════════════════════════════════

export interface QuestionSelectionStrategy {
  execute(
    eligibleQuestions: any[],
    snapshot: AdaptiveSnapshot,
    limit: number
  ): Promise<any[]>;
}

export class WeakestCompetencyFirstStrategy implements QuestionSelectionStrategy {
  public async execute(eligibleQuestions: any[], snapshot: AdaptiveSnapshot, limit: number): Promise<any[]> {
    // Sort target competencies by score ascending (weakest first)
    const sortedWeakCompetencies = Object.entries(snapshot.competencyLevels)
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);

    const sortedQuestions = [...eligibleQuestions].sort((a, b) => {
      const aComp = a.payload?.competencies?.[0] || '';
      const bComp = b.payload?.competencies?.[0] || '';
      const aIdx = sortedWeakCompetencies.indexOf(aComp);
      const bIdx = sortedWeakCompetencies.indexOf(bComp);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    return sortedQuestions.slice(0, limit);
  }
}

export class BalancedCoverageStrategy implements QuestionSelectionStrategy {
  public async execute(eligibleQuestions: any[], snapshot: AdaptiveSnapshot, limit: number): Promise<any[]> {
    // Distribute questions evenly among targeted competencies
    const competencies = Object.keys(snapshot.competencyLevels);
    if (competencies.length === 0) return eligibleQuestions.slice(0, limit);

    const buckets: Record<string, any[]> = {};
    for (const compId of competencies) {
      buckets[compId] = eligibleQuestions.filter(q => q.payload?.competencies?.includes(compId));
    }

    const results: any[] = [];
    let added = true;
    while (results.length < limit && added) {
      added = false;
      for (const compId of competencies) {
        if (results.length >= limit) break;
        const q = buckets[compId]?.shift();
        if (q) {
          results.push(q);
          added = true;
        }
      }
    }

    // Fill remaining if needed
    if (results.length < limit) {
      const remaining = eligibleQuestions.filter(q => !results.includes(q));
      results.push(...remaining.slice(0, limit - results.length));
    }

    return results;
  }
}

export class ExamBlueprintCoverageStrategy implements QuestionSelectionStrategy {
  public async execute(eligibleQuestions: any[], _snapshot: AdaptiveSnapshot, limit: number): Promise<any[]> {
    // Mock blueprint matching by targeting blueprint tag weights
    return eligibleQuestions.slice(0, limit);
  }
}

export class DifficultyProgressionStrategy implements QuestionSelectionStrategy {
  public async execute(eligibleQuestions: any[], snapshot: AdaptiveSnapshot, limit: number): Promise<any[]> {
    // Prioritize matching current difficulty profile
    const targetDiff = snapshot.difficultyProfile.minLevel || 'Intermediate';
    const sorted = [...eligibleQuestions].sort((a, b) => {
      const aDiff = a.payload?.difficulty || 'Beginner';
      const bDiff = b.payload?.difficulty || 'Beginner';
      if (aDiff === targetDiff && bDiff !== targetDiff) return -1;
      if (bDiff === targetDiff && aDiff !== targetDiff) return 1;
      return 0;
    });
    return sorted.slice(0, limit);
  }
}

export class RandomWithinConstraintsStrategy implements QuestionSelectionStrategy {
  public async execute(eligibleQuestions: any[], _snapshot: AdaptiveSnapshot, limit: number): Promise<any[]> {
    const shuffled = [...eligibleQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }
}

export class SelectionStrategyRegistry {
  private strategies = new Map<string, QuestionSelectionStrategy>();

  constructor() {
    this.strategies.set('WEAKEST_FIRST', new WeakestCompetencyFirstStrategy());
    this.strategies.set('BALANCED', new BalancedCoverageStrategy());
    this.strategies.set('BLUEPRINT', new ExamBlueprintCoverageStrategy());
    this.strategies.set('DIFFICULTY_PROG', new DifficultyProgressionStrategy());
    this.strategies.set('RANDOM', new RandomWithinConstraintsStrategy());
  }

  public get(code: string): QuestionSelectionStrategy {
    const s = this.strategies.get(code);
    if (!s) throw new Error(`Strategy not registered: ${code}`);
    return s;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class CreatePracticePlanHandler {
  constructor(private readonly planRepo: PracticePlanRepository) {}

  public async execute(cmd: {
    studentId: string;
    recommendationId?: string | undefined;
    title?: string | undefined;
    selectionRules: { attributeName: string; operator: string; value: string }[];
    targetedCompetencies: { competencyId: string; weight: number; targetPercentage: number }[];
    spacingPolicy: { reviewIntervalHours: number; expansionFactor: number; maxIntervalHours: number };
  }): Promise<string> {
    const id = this.planRepo.nextIdentity();
    const rules = cmd.selectionRules.map(
      r => new QuestionSelectionRule({ id: randomUUID(), attributeName: r.attributeName, operator: r.operator, value: r.value })
    );
    const comps = cmd.targetedCompetencies.map(
      c => new CompetencyCoverage({
        id: randomUUID(),
        competencyId: c.competencyId,
        coverageWeight: new SelectionWeight(c.weight),
        targetPercentage: new CoveragePercentage(c.targetPercentage),
      })
    );

    const plan = new PracticePlan({
      id,
      studentId: cmd.studentId,
      recommendationId: cmd.recommendationId,
      title: cmd.title,
      status: 'DRAFT',
      selectionRules: rules,
      targetedCompetencies: comps,
      spacingPolicy: new SpacingPolicy(cmd.spacingPolicy.reviewIntervalHours, cmd.spacingPolicy.expansionFactor, cmd.spacingPolicy.maxIntervalHours),
    });

    plan.generate();
    await this.planRepo.save(plan);
    return id;
  }
}

export class StartPracticeSessionHandler {
  constructor(private readonly sessionRepo: PracticeSessionRepository) {}

  public async execute(cmd: {
    sessionId: string;
    startedAt?: Date | undefined;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Practice Session not found');
    session.start(cmd.startedAt ?? new Date());
    await this.sessionRepo.save(session);
  }
}

export class PausePracticeSessionHandler {
  constructor(private readonly sessionRepo: PracticeSessionRepository) {}

  public async execute(cmd: {
    sessionId: string;
    pausedAt?: Date | undefined;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Practice Session not found');
    session.pause(cmd.pausedAt ?? new Date());
    await this.sessionRepo.save(session);
  }
}

export class ResumePracticeSessionHandler {
  constructor(private readonly sessionRepo: PracticeSessionRepository) {}

  public async execute(cmd: {
    sessionId: string;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Practice Session not found');
    session.resume();
    await this.sessionRepo.save(session);
  }
}

export class CompletePracticeSessionHandler {
  constructor(private readonly sessionRepo: PracticeSessionRepository) {}

  public async execute(cmd: {
    sessionId: string;
    completedAt?: Date | undefined;
    feedback?: {
      rating: number;
      difficultyPerception: string;
      confidence: string;
      satisfaction: string;
      usefulness: string;
      technicalIssue: boolean;
      recommendationQuality: string;
      comment?: string | undefined;
    } | undefined;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error('Practice Session not found');

    const fb = cmd.feedback ? new PracticeFeedback({
      id: randomUUID(),
      rating: cmd.feedback.rating,
      difficultyPerception: cmd.feedback.difficultyPerception,
      confidence: cmd.feedback.confidence,
      satisfaction: cmd.feedback.satisfaction,
      usefulness: cmd.feedback.usefulness,
      technicalIssue: cmd.feedback.technicalIssue,
      recommendationQuality: cmd.feedback.recommendationQuality,
      comment: cmd.feedback.comment,
    }) : undefined;

    session.complete(cmd.completedAt ?? new Date(), fb);
    await this.sessionRepo.save(session);
  }
}

export class GenerateRecommendationsHandler {
  constructor(private readonly recommendationRepo: RecommendationRepository) {}

  public async execute(cmd: {
    studentId: string;
    rules: Record<string, any>;
    source: string;
    priority: Priority;
    inputSnapshot: Record<string, any>;
    algorithmVersion: string;
    decisionTrace: Record<string, any>;
    outputPayload: Record<string, any>;
  }): Promise<string> {
    const id = this.recommendationRepo.nextIdentity();
    const rec = new PracticeRecommendation({
      id,
      studentId: cmd.studentId,
      recommendationRules: cmd.rules,
      recommendationSource: cmd.source,
      priority: new RecommendationPriority(cmd.priority, 1.0),
      status: 'PENDING',
      inputSnapshot: cmd.inputSnapshot,
      algorithmVersion: cmd.algorithmVersion,
      decisionTrace: cmd.decisionTrace,
      outputPayload: cmd.outputPayload,
    });

    await this.recommendationRepo.save(rec);
    return id;
  }
}

export class AcceptRecommendationHandler {
  constructor(
    private readonly recommendationRepo: RecommendationRepository
  ) {}

  public async execute(cmd: {
    recommendationId: string;
    planId: string;
  }): Promise<void> {
    const rec = await this.recommendationRepo.findById(cmd.recommendationId);
    if (!rec) throw new Error('Recommendation not found');
    rec.accept(cmd.planId);
    await this.recommendationRepo.save(rec);
  }
}

export class RejectRecommendationHandler {
  constructor(private readonly recommendationRepo: RecommendationRepository) {}

  public async execute(cmd: {
    recommendationId: string;
  }): Promise<void> {
    const rec = await this.recommendationRepo.findById(cmd.recommendationId);
    if (!rec) throw new Error('Recommendation not found');
    rec.reject();
    await this.recommendationRepo.save(rec);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class GetPracticeSessionHandler {
  constructor(private readonly sessionRepo: PracticeSessionRepository) {}

  public async execute(cmd: { sessionId: string }): Promise<PracticeSession | null> {
    return this.sessionRepo.findById(cmd.sessionId);
  }
}

export class GetPracticePlanHandler {
  constructor(private readonly planRepo: PracticePlanRepository) {}

  public async execute(cmd: { planId: string }): Promise<PracticePlan | null> {
    return this.planRepo.findById(cmd.planId);
  }
}

export class GetPracticeHistoryHandler {
  constructor(private readonly sessionRepo: PracticeSessionRepository) {}

  public async execute(cmd: { studentId: string; limit?: number | undefined; offset?: number | undefined }): Promise<PracticeSession[]> {
    return this.sessionRepo.search({
      studentId: cmd.studentId,
      status: 'COMPLETED',
      limit: cmd.limit,
      offset: cmd.offset,
    });
  }
}

export class SearchRecommendationsHandler {
  constructor(private readonly recommendationRepo: RecommendationRepository) {}

  public async execute(cmd: { studentId: string }): Promise<PracticeRecommendation[]> {
    return this.recommendationRepo.findPending(cmd.studentId);
  }
}
