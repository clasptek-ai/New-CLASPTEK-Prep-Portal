import { Entity, AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

export interface DomainEvent {
  aggregateId: string;
  occurredAt: Date;
}

// ───────────────────────────────────────────────────────────────────
// SECTION 1: VALUE OBJECTS
// ───────────────────────────────────────────────────────────────────

export class ReadinessScoreVO {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) throw new Error('ReadinessScore must be between 0 and 100');
  }
}

export class PredictionVariance {
  constructor(public readonly value: number) {
    if (value < 0) throw new Error('PredictionVariance cannot be negative');
  }
}

export class StabilityIndex {
  constructor(public readonly score: number) {
    if (score < 0 || score > 100) throw new Error('StabilityIndex must be between 0 and 100');
  }
}

export class ConfidenceScore {
  constructor(public readonly confidence: number) {
    if (confidence < 0 || confidence > 100)
      throw new Error('ConfidenceScore must be between 0 and 100');
  }
}

export class SkillWeight {
  constructor(public readonly weight: number) {
    if (weight < 0 || weight > 1) throw new Error('SkillWeight must be between 0.0 and 1.0');
  }
}

export class ContributionPercentage {
  constructor(public readonly percentage: number) {
    if (percentage < 0 || percentage > 100)
      throw new Error('ContributionPercentage must be between 0 and 100');
  }
}

export class GoalProbability {
  constructor(public readonly probability: number) {
    if (probability < 0 || probability > 1)
      throw new Error('GoalProbability must be between 0.0 and 1.0');
  }
}

export class EstimatedAchievementDate {
  constructor(public readonly date: Date) {}
}

export class ReadinessLearningVelocity {
  constructor(public readonly rate: number) {}
}

export type TrendDirectionType =
  'ACCELERATING' | 'IMPROVING' | 'PLATEAU' | 'DECLINING' | 'RECOVERING';

export class TrendDirection {
  constructor(public readonly value: TrendDirectionType) {}
}

// ───────────────────────────────────────────────────────────────────
// SECTION 2: DOMAIN EVENTS
// ───────────────────────────────────────────────────────────────────

export class ReadinessImproved {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly previousScore: number,
    public readonly newScore: number
  ) {}
}

export class ReadinessDeclined {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly previousScore: number,
    public readonly newScore: number
  ) {}
}

export class PredictionVolatilityDetected {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly stabilityScore: number,
    public readonly state: string
  ) {}
}

export class ConfidenceChanged {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly previousConfidence: number,
    public readonly newConfidence: number
  ) {}
}

export class ScenarioCompleted {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly scenarioName: string,
    public readonly versionNumber: number
  ) {}
}

export class BenchmarkUpdated {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly examProfileCode: string,
    public readonly avgReadiness: number
  ) {}
}

export class TargetAchieved {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly studentId: string,
    public readonly targetScore: number
  ) {}
}

export class TargetMissed {
  public readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: string,
    public readonly studentId: string,
    public readonly targetScore: number
  ) {}
}

// ───────────────────────────────────────────────────────────────────
// SECTION 3: ENTITIES & AGGREGATES
// ───────────────────────────────────────────────────────────────────

/** Immutable historical snapshot of student input competency capture */
export class ReadinessStateSnapshot extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly timelineId: string;
  public readonly studentId: string;
  public readonly profileId: string;
  public readonly readinessScore: ReadinessScoreVO;
  public readonly competencyMastery: Record<string, number>;
  public readonly learnerState: Record<string, any>;
  public readonly practiceStatistics: Record<string, any>;
  public readonly studyStreak: Record<string, any>;
  public readonly createdBy: string;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    tenantId: string;
    timelineId: string;
    studentId: string;
    profileId: string;
    readinessScore: ReadinessScoreVO;
    competencyMastery?: Record<string, number> | undefined;
    learnerState?: Record<string, any> | undefined;
    practiceStatistics?: Record<string, any> | undefined;
    studyStreak?: Record<string, any> | undefined;
    createdBy: string;
    createdAt?: Date | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.timelineId = props.timelineId;
    this.studentId = props.studentId;
    this.profileId = props.profileId;
    this.readinessScore = props.readinessScore;
    this.competencyMastery = props.competencyMastery ?? {};
    this.learnerState = props.learnerState ?? {};
    this.practiceStatistics = props.practiceStatistics ?? {};
    this.studyStreak = props.studyStreak ?? {};
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt ?? new Date();
  }
}

/** Represents calculated trends over timeline slices */
export class TimelineTrend extends Entity<string> {
  public readonly tenantId: string;
  public readonly timelineId: string;
  public readonly studentId: string;
  public readonly trendDirection: TrendDirection;
  public readonly learningVelocity: ReadinessLearningVelocity;
  public readonly slope: number;
  public readonly measuredAt: Date;

  constructor(props: {
    id: string;
    tenantId: string;
    timelineId: string;
    studentId: string;
    trendDirection: TrendDirection;
    learningVelocity: ReadinessLearningVelocity;
    slope: number;
    measuredAt?: Date | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.timelineId = props.timelineId;
    this.studentId = props.studentId;
    this.trendDirection = props.trendDirection;
    this.learningVelocity = props.learningVelocity;
    this.slope = props.slope;
    this.measuredAt = props.measuredAt ?? new Date();
  }
}

/** ReadinessTimeline tracks historical trends and aggregates snapshots */
export class ReadinessTimeline extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly studentId: string;
  public readonly profileId: string;
  private _status: 'ACTIVE' | 'ARCHIVED';
  private _snapshots: ReadinessStateSnapshot[] = [];
  private _trends: TimelineTrend[] = [];

  constructor(props: {
    id: string;
    tenantId: string;
    studentId: string;
    profileId: string;
    status?: 'ACTIVE' | 'ARCHIVED' | undefined;
    snapshots?: ReadinessStateSnapshot[] | undefined;
    trends?: TimelineTrend[] | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.studentId = props.studentId;
    this.profileId = props.profileId;
    this._status = props.status ?? 'ACTIVE';
    this._snapshots = props.snapshots ?? [];
    this._trends = props.trends ?? [];
  }

  get status(): 'ACTIVE' | 'ARCHIVED' {
    return this._status;
  }
  get snapshots(): readonly ReadinessStateSnapshot[] {
    return this._snapshots;
  }
  get trends(): readonly TimelineTrend[] {
    return this._trends;
  }

  public addSnapshot(snapshot: ReadinessStateSnapshot): void {
    if (this._status !== 'ACTIVE') throw new Error('Cannot add snapshots to archived timelines');
    const oldScore = this.getLatestScore();
    this._snapshots.push(snapshot);
    const newScore = snapshot.readinessScore.value;

    if (oldScore !== null) {
      if (newScore > oldScore) {
        this.addDomainEvent(new ReadinessImproved(this.id, oldScore, newScore));
      } else if (newScore < oldScore) {
        this.addDomainEvent(new ReadinessDeclined(this.id, oldScore, newScore));
      }
    }
  }

  public addTrend(trend: TimelineTrend): void {
    this._trends.push(trend);
  }

  public archive(): void {
    this._status = 'ARCHIVED';
  }

  public getLatestScore(): number | null {
    if (this._snapshots.length === 0) return null;
    const sorted = [...this._snapshots].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return sorted[0].readinessScore.value;
  }
}

/** PredictionVolatilityState types */
export type PredictionVolatilityState = 'STABLE' | 'IMPROVING' | 'DECLINING' | 'HIGHLY_VOLATILE';

/** Tracks prediction output variance and stability states over time */
export class PredictionStability extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly studentId: string;
  public readonly profileId: string;
  private _stabilityScore: StabilityIndex;
  private _variance: PredictionVariance;
  private _volatilityState: PredictionVolatilityState;
  private _confidenceTrend: 'UPWARD' | 'STABLE' | 'DOWNWARD';

  constructor(props: {
    id: string;
    tenantId: string;
    studentId: string;
    profileId: string;
    stabilityScore: StabilityIndex;
    variance: PredictionVariance;
    volatilityState: PredictionVolatilityState;
    confidenceTrend: 'UPWARD' | 'STABLE' | 'DOWNWARD';
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.studentId = props.studentId;
    this.profileId = props.profileId;
    this._stabilityScore = props.stabilityScore;
    this._variance = props.variance;
    this._volatilityState = props.volatilityState;
    this._confidenceTrend = props.confidenceTrend;
  }

  get stabilityScore(): StabilityIndex {
    return this._stabilityScore;
  }
  get variance(): PredictionVariance {
    return this._variance;
  }
  get volatilityState(): PredictionVolatilityState {
    return this._volatilityState;
  }
  get confidenceTrend(): 'UPWARD' | 'STABLE' | 'DOWNWARD' {
    return this._confidenceTrend;
  }

  public updateStability(
    score: StabilityIndex,
    variance: PredictionVariance,
    state: PredictionVolatilityState,
    confTrend: 'UPWARD' | 'STABLE' | 'DOWNWARD'
  ): void {
    this._stabilityScore = score;
    this._variance = variance;
    this._volatilityState = state;
    this._confidenceTrend = confTrend;

    if (state === 'HIGHLY_VOLATILE') {
      this.addDomainEvent(new PredictionVolatilityDetected(this.id, score.score, state));
    }
  }
}

/** Specific skill weight details */
export class SkillContribution extends Entity<string> {
  public readonly skillName: string;
  public readonly weight: SkillWeight;
  public readonly contribution: ContributionPercentage;

  constructor(props: {
    id: string;
    skillName: string;
    weight: SkillWeight;
    contribution: ContributionPercentage;
  }) {
    super(props.id);
    this.skillName = props.skillName;
    this.weight = props.weight;
    this.contribution = props.contribution;
  }
}

/** Scenario version detail inputs */
export class ScenarioSnapshot extends Entity<string> {
  public readonly simulatedInputs: Record<string, any>;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    simulatedInputs: Record<string, any>;
    createdAt?: Date | undefined;
  }) {
    super(props.id);
    this.simulatedInputs = props.simulatedInputs;
    this.createdAt = props.createdAt ?? new Date();
  }
}

/** Scenario prediction projections outputs */
export class ScenarioResult extends Entity<string> {
  public readonly projectedReadiness: ReadinessScoreVO;
  public readonly predictedOfficialScore: number;
  public readonly estimatedAchievementDate: EstimatedAchievementDate;
  public readonly goalProbability: GoalProbability;

  constructor(props: {
    id: string;
    projectedReadiness: ReadinessScoreVO;
    predictedOfficialScore: number;
    estimatedAchievementDate: EstimatedAchievementDate;
    goalProbability: GoalProbability;
  }) {
    super(props.id);
    this.projectedReadiness = props.projectedReadiness;
    this.predictedOfficialScore = props.predictedOfficialScore;
    this.estimatedAchievementDate = props.estimatedAchievementDate;
    this.goalProbability = props.goalProbability;
  }
}

/** Version wrapper for Persistent scenarios */
export class ScenarioVersion extends Entity<string> {
  public readonly versionNumber: number;
  public readonly notes: string | undefined;
  public readonly snapshot: ScenarioSnapshot;
  public readonly result: ScenarioResult;

  constructor(props: {
    id: string;
    versionNumber: number;
    notes?: string | undefined;
    snapshot: ScenarioSnapshot;
    result: ScenarioResult;
  }) {
    super(props.id);
    this.versionNumber = props.versionNumber;
    this.notes = props.notes;
    this.snapshot = props.snapshot;
    this.result = props.result;
  }
}

/** TargetScenario aggregate root for simulated what-if planning */
export class TargetScenario extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly studentId: string;
  public readonly scenarioName: string;
  private _versions: ScenarioVersion[] = [];

  constructor(props: {
    id: string;
    tenantId: string;
    studentId: string;
    scenarioName: string;
    versions?: ScenarioVersion[] | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.studentId = props.studentId;
    this.scenarioName = props.scenarioName;
    this._versions = props.versions ?? [];
  }

  get scenarioNameVal(): string {
    return this.scenarioName;
  }
  get versions(): readonly ScenarioVersion[] {
    return this._versions;
  }

  public addVersion(version: ScenarioVersion): void {
    this._versions.push(version);
    this.addDomainEvent(new ScenarioCompleted(this.id, this.scenarioName, version.versionNumber));
  }
}

/** Cohort, Instructor, and pathway benchmarks entities */
export class CohortBenchmark extends Entity<string> {
  public readonly cohortCode: string;
  public readonly avgReadinessScore: number;
  public readonly percentileRank: number;
  public readonly peerCohortRank: string | undefined;
  public readonly expectedRank: string | undefined;

  constructor(props: {
    id: string;
    cohortCode: string;
    avgReadinessScore: number;
    percentileRank: number;
    peerCohortRank?: string | undefined;
    expectedRank?: string | undefined;
  }) {
    super(props.id);
    this.cohortCode = props.cohortCode;
    this.avgReadinessScore = props.avgReadinessScore;
    this.percentileRank = props.percentileRank;
    this.peerCohortRank = props.peerCohortRank;
    this.expectedRank = props.expectedRank;
  }
}

export class InstructorBenchmark extends Entity<string> {
  public readonly instructorId: string;
  public readonly avgReadinessScore: number;
  public readonly totalLearnerCount: number;

  constructor(props: {
    id: string;
    instructorId: string;
    avgReadinessScore: number;
    totalLearnerCount: number;
  }) {
    super(props.id);
    this.instructorId = props.instructorId;
    this.avgReadinessScore = props.avgReadinessScore;
    this.totalLearnerCount = props.totalLearnerCount;
  }
}

export class LearningPathwayBenchmark extends Entity<string> {
  public readonly pathwayCode: string;
  public readonly avgReadinessScore: number;
  public readonly velocitySlope: number;

  constructor(props: {
    id: string;
    pathwayCode: string;
    avgReadinessScore: number;
    velocitySlope: number;
  }) {
    super(props.id);
    this.pathwayCode = props.pathwayCode;
    this.avgReadinessScore = props.avgReadinessScore;
    this.velocitySlope = props.velocitySlope;
  }
}

/** InstitutionalBenchmark aggregate root for privacy-preserving cohort metrics */
export class InstitutionalBenchmark extends AggregateRoot<string> {
  public readonly tenantId: string;
  public readonly examProfileCode: string;
  public readonly avgReadinessScore: number;
  public readonly totalStudentCount: number;
  public readonly readinessDistribution: Record<string, number>;
  public readonly successForecast: Record<string, number>;
  public readonly measuredAt: Date;
  private _cohorts: CohortBenchmark[] = [];
  private _instructors: InstructorBenchmark[] = [];
  private _pathways: LearningPathwayBenchmark[] = [];

  constructor(props: {
    id: string;
    tenantId: string;
    examProfileCode: string;
    avgReadinessScore: number;
    totalStudentCount: number;
    readinessDistribution?: Record<string, number> | undefined;
    successForecast?: Record<string, number> | undefined;
    measuredAt?: Date | undefined;
    cohorts?: CohortBenchmark[] | undefined;
    instructors?: InstructorBenchmark[] | undefined;
    pathways?: LearningPathwayBenchmark[] | undefined;
  }) {
    super(props.id);
    this.tenantId = props.tenantId;
    this.examProfileCode = props.examProfileCode;
    this.avgReadinessScore = props.avgReadinessScore;
    this.totalStudentCount = props.totalStudentCount;
    this.readinessDistribution = props.readinessDistribution ?? {};
    this.successForecast = props.successForecast ?? {};
    this.measuredAt = props.measuredAt ?? new Date();
    this._cohorts = props.cohorts ?? [];
    this._instructors = props.instructors ?? [];
    this._pathways = props.pathways ?? [];
  }

  get cohorts(): readonly CohortBenchmark[] {
    return this._cohorts;
  }
  get instructors(): readonly InstructorBenchmark[] {
    return this._instructors;
  }
  get pathways(): readonly LearningPathwayBenchmark[] {
    return this._pathways;
  }

  public addCohort(cb: CohortBenchmark): void {
    this._cohorts.push(cb);
  }

  public addInstructor(ib: InstructorBenchmark): void {
    this._instructors.push(ib);
  }

  public addPathway(pb: LearningPathwayBenchmark): void {
    this._pathways.push(pb);
  }

  public triggerUpdate(): void {
    this.addDomainEvent(
      new BenchmarkUpdated(this.id, this.examProfileCode, this.avgReadinessScore)
    );
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 4: DOMAIN ENGINES & SERVICES
// ───────────────────────────────────────────────────────────────────

export class ReadinessTimelineEngine {
  /** Computes the trend line slope, velocity, and classifiers */
  public calculateTrend(snapshots: ReadinessStateSnapshot[]): TimelineTrend {
    if (snapshots.length === 0) {
      return new TimelineTrend({
        id: randomUUID(),
        tenantId: '00000000-0000-0000-0000-000000000000',
        timelineId: randomUUID(),
        studentId: '00000000-0000-0000-0000-000000000000',
        trendDirection: new TrendDirection('PLATEAU'),
        learningVelocity: new ReadinessLearningVelocity(0),
        slope: 0,
      });
    }

    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const n = sorted.length;
    const first = sorted[0];
    const last = sorted[n - 1];

    // Simple Linear Regression slope calculation
    let slope = 0;
    if (n > 1) {
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0;
      for (let i = 0; i < n; i++) {
        const x = i;
        const y = sorted[i].readinessScore.value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      }
      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    }

    let direction: TrendDirectionType = 'PLATEAU';
    if (slope > 5) {
      direction = 'ACCELERATING';
    } else if (slope > 1) {
      direction = 'IMPROVING';
    } else if (slope < -1) {
      direction = 'DECLINING';
    } else if (slope >= -1 && slope <= 1) {
      // Check if recovering from a low
      const minScore = Math.min(...sorted.map((s) => s.readinessScore.value));
      if (last.readinessScore.value > minScore + 10) {
        direction = 'RECOVERING';
      } else {
        direction = 'PLATEAU';
      }
    }

    const velocity = (last.readinessScore.value - first.readinessScore.value) / (n || 1);

    return new TimelineTrend({
      id: randomUUID(),
      tenantId: last.tenantId,
      timelineId: last.timelineId,
      studentId: last.studentId,
      trendDirection: new TrendDirection(direction),
      learningVelocity: new ReadinessLearningVelocity(velocity),
      slope,
      measuredAt: new Date(),
    });
  }
}

export class PredictionStabilityEngine {
  /** Computes variance and classifies volatility state */
  public evaluateStability(props: {
    tenantId: string;
    studentId: string;
    profileId: string;
    recentScores: number[];
    learningVelocity: number;
    mockScores: number[];
    practiceCount: number;
  }): PredictionStability {
    const scores = props.recentScores;
    const n = scores.length;
    if (n === 0) {
      return new PredictionStability({
        id: randomUUID(),
        tenantId: props.tenantId,
        studentId: props.studentId,
        profileId: props.profileId,
        stabilityScore: new StabilityIndex(100),
        variance: new PredictionVariance(0),
        volatilityState: 'STABLE',
        confidenceTrend: 'STABLE',
      });
    }

    const mean = scores.reduce((sum, val) => sum + val, 0) / n;
    const varianceVal = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

    let state: PredictionVolatilityState = 'STABLE';
    let stabilityScoreVal = Math.max(0, 100 - varianceVal * 5);

    if (varianceVal > 15) {
      state = 'HIGHLY_VOLATILE';
    } else if (props.learningVelocity > 2) {
      state = 'IMPROVING';
    } else if (props.learningVelocity < -2) {
      state = 'DECLINING';
    }

    // Determine confidence trend direction
    let confTrend: 'UPWARD' | 'STABLE' | 'DOWNWARD' = 'STABLE';
    if (n > 1) {
      const first = scores[0];
      const last = scores[n - 1];
      if (last > first + 5) confTrend = 'UPWARD';
      else if (last < first - 5) confTrend = 'DOWNWARD';
    }

    return new PredictionStability({
      id: randomUUID(),
      tenantId: props.tenantId,
      studentId: props.studentId,
      profileId: props.profileId,
      stabilityScore: new StabilityIndex(Math.round(stabilityScoreVal)),
      variance: new PredictionVariance(varianceVal),
      volatilityState: state,
      confidenceTrend: confTrend,
    });
  }
}

export class SkillContributionEngine {
  /** Calculates skill contributions and guarantees they sum to exactly 100% */
  public calculateContributions(competencyScores: Record<string, number>): SkillContribution[] {
    const skills = [
      'Reading',
      'Writing',
      'Listening',
      'Speaking',
      'Grammar',
      'Vocabulary',
      'Study Consistency',
    ];
    let sum = 0;
    const items: Array<{ name: string; val: number }> = [];

    skills.forEach((skill) => {
      // Clean name match
      const key = skill.toLowerCase().replace(' ', '');
      const rawVal = competencyScores[key] ?? competencyScores[skill] ?? 50; // Default 50
      sum += rawVal;
      items.push({ name: skill, val: rawVal });
    });

    if (sum === 0) sum = skills.length;

    let totalPercent = 0;
    const contributions = items.map((item, idx) => {
      let percent = Math.round((item.val / sum) * 100);
      if (idx === items.length - 1) {
        // Guarantee 100% sum
        percent = 100 - totalPercent;
      } else {
        totalPercent += percent;
      }

      return new SkillContribution({
        id: randomUUID(),
        skillName: item.name,
        weight: new SkillWeight(item.val / 100),
        contribution: new ContributionPercentage(percent),
      });
    });

    return contributions;
  }
}

export class ReadinessExplanationEngine {
  /** Renders explanation advice based on contributions */
  public generateExplanation(contributions: SkillContribution[]): {
    explanationText: string;
    priorityFocus: string[];
    advice: string;
  } {
    const sorted = [...contributions].sort(
      (a, b) => b.contribution.percentage - a.contribution.percentage
    );
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    const explanationText = `Your overall readiness score is heavily driven by your performance in ${top.skillName} (${top.contribution.percentage}%), while ${bottom.skillName} has the lowest contribution (${bottom.contribution.percentage}%).`;
    const priorityFocus = sorted
      .slice(sorted.length - 3)
      .reverse()
      .map((c) => c.skillName);
    const advice = `Focus your study plan immediately on improving ${bottom.skillName} to optimize your readiness probability velocity.`;

    return { explanationText, priorityFocus, advice };
  }
}

export class ScenarioPlanningEngine {
  /** Runs "what-if" forecasting simulation scenarios */
  public simulateScenario(props: {
    currentReadiness: number;
    scenarioCode:
      | 'WRITING_IMPROVEMENT'
      | 'MOCK_EXAMS'
      | 'STUDY_CONSISTENCY'
      | 'READING_ACCURACY'
      | 'STUDY_TIME';
    hoursSimulated: number;
  }): {
    projectedReadiness: ReadinessScoreVO;
    predictedOfficialScore: number;
    estimatedAchievementDate: EstimatedAchievementDate;
    goalProbability: GoalProbability;
  } {
    let boost = 0;
    let daysToAchieve = 30;

    switch (props.scenarioCode) {
      case 'WRITING_IMPROVEMENT':
        boost = 8;
        daysToAchieve = 14;
        break;
      case 'MOCK_EXAMS':
        boost = 12;
        daysToAchieve = 21;
        break;
      case 'STUDY_CONSISTENCY':
        boost = 15;
        daysToAchieve = 10;
        break;
      case 'READING_ACCURACY':
        boost = 7;
        daysToAchieve = 25;
        break;
      case 'STUDY_TIME':
        boost = props.hoursSimulated * 1.5;
        daysToAchieve = Math.max(7, 40 - props.hoursSimulated * 2);
        break;
    }

    const projected = Math.min(100, props.currentReadiness + boost);
    // Scale standard 0-100% to standard 0-9 scale (IELTS band)
    const bandScore = Math.round((projected / 100) * 9 * 2) / 2;
    const probability = 0.5 + projected / 200;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAchieve);

    return {
      projectedReadiness: new ReadinessScoreVO(projected),
      predictedOfficialScore: bandScore,
      estimatedAchievementDate: new EstimatedAchievementDate(targetDate),
      goalProbability: new GoalProbability(probability),
    };
  }
}

export class PredictionConfidenceReport {
  constructor(
    public readonly confidence: ConfidenceScore,
    public readonly level: 'HIGHLY_RELIABLE' | 'RELIABLE' | 'MODERATE' | 'NEEDS_EVIDENCE',
    public readonly evidenceQuality: number,
    public readonly stabilityScore: number,
    public readonly coverageScore: number,
    public readonly recommendations: string[]
  ) {}
}

export class ConfidenceAssessmentEngine {
  /** Assesses confidence, creates detailed report, and gives recommendations */
  public assessConfidence(props: {
    studentId: string;
    profileId: string;
    stabilityScore: number;
    mockExamCount: number;
    completedPracticeQuestions: number;
    lastEvaluationScore: number;
  }): PredictionConfidenceReport {
    // Math to compute confidence
    let coverage = Math.min(
      100,
      (props.completedPracticeQuestions / 150) * 40 + (props.mockExamCount / 3) * 60
    );
    let evidenceQuality = props.mockExamCount >= 3 ? 95 : props.mockExamCount >= 1 ? 80 : 50;

    let computedScore = Math.round(
      props.stabilityScore * 0.4 + coverage * 0.4 + evidenceQuality * 0.2
    );
    computedScore = Math.max(20, Math.min(100, computedScore));

    let level: 'HIGHLY_RELIABLE' | 'RELIABLE' | 'MODERATE' | 'NEEDS_EVIDENCE' = 'NEEDS_EVIDENCE';
    const recs: string[] = [];

    if (computedScore >= 95) {
      level = 'HIGHLY_RELIABLE';
      recs.push('Maintain study consistency. Your current forecasts are highly stable.');
    } else if (computedScore >= 85) {
      level = 'RELIABLE';
      recs.push(
        'Excellent progress. Take one additional mock exam to maximize calibration accuracy.'
      );
    } else if (computedScore >= 70) {
      level = 'MODERATE';
      recs.push('Increase study consistency. Daily practice is needed to stabilize outputs.');
    } else {
      level = 'NEEDS_EVIDENCE';
      recs.push(
        'Collect more learning evidence. Complete at least 2 mock exams and 50 practice questions.'
      );
    }

    return new PredictionConfidenceReport(
      new ConfidenceScore(computedScore),
      level,
      evidenceQuality,
      props.stabilityScore,
      Math.round(coverage),
      recs
    );
  }
}

export class InstitutionalBenchmarkEngine {
  /** Aggregates cohort benchmarking records with privacy locks */
  public computeBenchmarks(props: {
    tenantId: string;
    examProfileCode: string;
    cohortAverages: Record<string, number>;
    cohortCounts: Record<string, number>;
    instructorAverages: Record<string, number>;
    instructorCounts: Record<string, number>;
    pathwayAverages: Record<string, number>;
  }): InstitutionalBenchmark | null {
    // Enforce privacy rule: Cohort minimum threshold of 5 students
    let totalStudentCount = 0;
    let sumScore = 0;

    const benchmark = new InstitutionalBenchmark({
      id: randomUUID(),
      tenantId: props.tenantId,
      examProfileCode: props.examProfileCode,
      avgReadinessScore: 0,
      totalStudentCount: 0,
      readinessDistribution: {},
      successForecast: {},
    });

    // 1. Cohort
    Object.entries(props.cohortAverages).forEach(([code, avg]) => {
      const count = props.cohortCounts[code] ?? 0;
      if (count < 5) return; // Privacy lock skip

      totalStudentCount += count;
      sumScore += avg * count;

      benchmark.addCohort(
        new CohortBenchmark({
          id: randomUUID(),
          cohortCode: code,
          avgReadinessScore: avg,
          percentileRank: 85.5,
          peerCohortRank: 'Top 15%',
          expectedRank: 'A',
        })
      );
    });

    if (totalStudentCount < 5) return null; // Anonymization gate

    // 2. Instructor
    Object.entries(props.instructorAverages).forEach(([instId, avg]) => {
      const count = props.instructorCounts[instId] ?? 0;
      if (count < 5) return; // Privacy lock skip
      benchmark.addInstructor(
        new InstructorBenchmark({
          id: randomUUID(),
          instructorId: instId,
          avgReadinessScore: avg,
          totalLearnerCount: count,
        })
      );
    });

    // 3. Pathway
    Object.entries(props.pathwayAverages).forEach(([code, avg]) => {
      benchmark.addPathway(
        new LearningPathwayBenchmark({
          id: randomUUID(),
          pathwayCode: code,
          avgReadinessScore: avg,
          velocitySlope: 1.25,
        })
      );
    });

    // Set updated values
    const finalAvg = Math.round((sumScore / totalStudentCount) * 100) / 100;
    const instBenchmark = new InstitutionalBenchmark({
      id: benchmark.id,
      tenantId: props.tenantId,
      examProfileCode: props.examProfileCode,
      avgReadinessScore: finalAvg,
      totalStudentCount,
      readinessDistribution: { '70-80': 40, '80-90': 45, '90-100': 15 },
      successForecast: { PASS: 88, FAIL: 12 },
      cohorts: [...benchmark.cohorts],
      instructors: [...benchmark.instructors],
      pathways: [...benchmark.pathways],
    });

    instBenchmark.triggerUpdate();
    return instBenchmark;
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 5: OUTBOUND INTEGRATION CONTRACTS
// ───────────────────────────────────────────────────────────────────

export interface IReadinessInsightsProvider {
  getLatestReadinessDashboardView(
    studentId: string,
    profileId: string
  ): Promise<StudentReadinessDashboardView | null>;
  getScenarioPlanningProjections(
    studentId: string,
    scenarioId: string
  ): Promise<ScenarioProjectionView[]>;
}

// ───────────────────────────────────────────────────────────────────
// SECTION 6: PROJECTION VIEW MODELS (DTOs)
// ───────────────────────────────────────────────────────────────────

export interface StudentReadinessDashboardView {
  overallScore: number;
  stabilityScore: number;
  volatilityState: string;
  trendDirection: string;
  learningVelocity: number;
  confidenceReport: {
    score: number;
    level: string;
    evidenceQuality: number;
    coverageScore: number;
    recommendations: string[];
  };
  skillsContribution: Array<{ skillName: string; percentage: number }>;
}

export interface InstructorReadinessDashboardView {
  cohortCode: string;
  studentCount: number;
  avgReadiness: number;
  atRiskCount: number;
  timelineProgress: Array<{ date: string; avgScore: number }>;
}

export interface InstitutionBenchmarkView {
  examProfileCode: string;
  avgReadinessScore: number;
  totalStudents: number;
  distribution: Record<string, number>;
  forecast: Record<string, number>;
  cohortsRankings: Array<{ cohortCode: string; avgReadiness: number; expectedRank: string }>;
}

export interface ScenarioProjectionView {
  scenarioName: string;
  versionNumber: number;
  projectedReadiness: number;
  predictedOfficialScore: number;
  estimatedAchievementDate: Date;
  goalProbability: number;
  notes?: string | undefined;
}
