import {
  ReadinessTimeline,
  ReadinessStateSnapshot,
  PredictionStability,
  TargetScenario,
  ScenarioVersion,
  ScenarioSnapshot,
  ScenarioResult,
  InstitutionalBenchmark,
  TimelineTrend,
  ReadinessTimelineEngine,
  PredictionStabilityEngine,
  SkillContributionEngine,
  ReadinessExplanationEngine,
  ScenarioPlanningEngine,
  InstitutionalBenchmarkEngine,
  ReadinessScoreVO,
  SkillContribution,
  InstitutionBenchmarkView,
  ScenarioProjectionView,
} from '@clasptek/domain-prediction-engine';
import { randomUUID } from 'crypto';

// ───────────────────────────────────────────────────────────────────
// SECTION 1: REPOSITORY CONTRACTS
// ───────────────────────────────────────────────────────────────────

export interface ReadinessTimelineRepository {
  save(timeline: ReadinessTimeline): Promise<void>;
  findById(id: string): Promise<ReadinessTimeline | null>;
  findByStudent(studentId: string, profileId: string): Promise<ReadinessTimeline | null>;
}

export interface ReadinessStateSnapshotRepository {
  save(snapshot: ReadinessStateSnapshot): Promise<void>;
  findById(id: string): Promise<ReadinessStateSnapshot | null>;
  findByTimeline(timelineId: string): Promise<ReadinessStateSnapshot[]>;
}

export interface PredictionStabilityRepository {
  save(stability: PredictionStability): Promise<void>;
  findById(id: string): Promise<PredictionStability | null>;
  findByStudent(studentId: string, profileId: string): Promise<PredictionStability | null>;
}

export interface ScenarioRepository {
  save(scenario: TargetScenario): Promise<void>;
  findById(id: string): Promise<TargetScenario | null>;
  findByStudent(studentId: string): Promise<TargetScenario[]>;
}

export interface BenchmarkRepository {
  save(benchmark: InstitutionalBenchmark): Promise<void>;
  findById(id: string): Promise<InstitutionalBenchmark | null>;
  findByExam(examProfileCode: string): Promise<InstitutionalBenchmark | null>;
}

// ───────────────────────────────────────────────────────────────────
// SECTION 2: COMMAND HANDLERS
// ───────────────────────────────────────────────────────────────────

export interface RecordReadinessSnapshotCommand {
  tenantId: string;
  studentId: string;
  profileId: string;
  readinessScore: number;
  competencyMastery: Record<string, number>;
  learnerState: Record<string, any>;
  practiceStatistics: Record<string, any>;
  studyStreak: Record<string, any>;
  createdBy: string;
}

export class RecordReadinessSnapshotHandler {
  constructor(
    private readonly timelineRepo: ReadinessTimelineRepository,
    private readonly snapshotRepo: ReadinessStateSnapshotRepository
  ) {}

  public async execute(cmd: RecordReadinessSnapshotCommand): Promise<string> {
    let timeline = await this.timelineRepo.findByStudent(cmd.studentId, cmd.profileId);
    if (!timeline) {
      timeline = new ReadinessTimeline({
        id: randomUUID(),
        tenantId: cmd.tenantId,
        studentId: cmd.studentId,
        profileId: cmd.profileId,
      });
      await this.timelineRepo.save(timeline);
    }

    const snapshot = new ReadinessStateSnapshot({
      id: randomUUID(),
      tenantId: cmd.tenantId,
      timelineId: timeline.id,
      studentId: cmd.studentId,
      profileId: cmd.profileId,
      readinessScore: new ReadinessScoreVO(cmd.readinessScore),
      competencyMastery: cmd.competencyMastery,
      learnerState: cmd.learnerState,
      practiceStatistics: cmd.practiceStatistics,
      studyStreak: cmd.studyStreak,
      createdBy: cmd.createdBy,
    });

    await this.snapshotRepo.save(snapshot);
    timeline.addSnapshot(snapshot);
    await this.timelineRepo.save(timeline);

    return snapshot.id;
  }
}

export interface UpdatePredictionStabilityCommand {
  tenantId: string;
  studentId: string;
  profileId: string;
  recentScores: number[];
  learningVelocity: number;
  mockScores: number[];
  practiceCount: number;
}

export class UpdatePredictionStabilityHandler {
  private readonly stabilityEngine = new PredictionStabilityEngine();

  constructor(private readonly stabilityRepo: PredictionStabilityRepository) {}

  public async execute(cmd: UpdatePredictionStabilityCommand): Promise<string> {
    let stability = await this.stabilityRepo.findByStudent(cmd.studentId, cmd.profileId);

    const calculated = this.stabilityEngine.evaluateStability({
      tenantId: cmd.tenantId,
      studentId: cmd.studentId,
      profileId: cmd.profileId,
      recentScores: cmd.recentScores,
      learningVelocity: cmd.learningVelocity,
      mockScores: cmd.mockScores,
      practiceCount: cmd.practiceCount,
    });

    if (!stability) {
      stability = calculated;
    } else {
      stability.updateStability(
        calculated.stabilityScore,
        calculated.variance,
        calculated.volatilityState,
        calculated.confidenceTrend
      );
    }

    await this.stabilityRepo.save(stability);
    return stability.id;
  }
}

export interface GenerateScenarioCommand {
  tenantId: string;
  studentId: string;
  scenarioName: string;
  scenarioCode:
    'WRITING_IMPROVEMENT' | 'MOCK_EXAMS' | 'STUDY_CONSISTENCY' | 'READING_ACCURACY' | 'STUDY_TIME';
  currentReadiness: number;
  hoursSimulated: number;
  notes?: string;
}

export class GenerateScenarioHandler {
  private readonly scenarioEngine = new ScenarioPlanningEngine();

  constructor(private readonly scenarioRepo: ScenarioRepository) {}

  public async execute(cmd: GenerateScenarioCommand): Promise<string> {
    const existingScenarios = await this.scenarioRepo.findByStudent(cmd.studentId);
    let scenario = existingScenarios.find((s) => s.scenarioName === cmd.scenarioName);

    if (!scenario) {
      scenario = new TargetScenario({
        id: randomUUID(),
        tenantId: cmd.tenantId,
        studentId: cmd.studentId,
        scenarioName: cmd.scenarioName,
      });
    }

    const versionNum = scenario.versions.length + 1;
    const sim = this.scenarioEngine.simulateScenario({
      currentReadiness: cmd.currentReadiness,
      scenarioCode: cmd.scenarioCode,
      hoursSimulated: cmd.hoursSimulated,
    });

    const snapshot = new ScenarioSnapshot({
      id: randomUUID(),
      simulatedInputs: {
        scenarioCode: cmd.scenarioCode,
        currentReadiness: cmd.currentReadiness,
        hoursSimulated: cmd.hoursSimulated,
      },
    });

    const result = new ScenarioResult({
      id: randomUUID(),
      projectedReadiness: sim.projectedReadiness,
      predictedOfficialScore: sim.predictedOfficialScore,
      estimatedAchievementDate: sim.estimatedAchievementDate,
      goalProbability: sim.goalProbability,
    });

    const version = new ScenarioVersion({
      id: randomUUID(),
      versionNumber: versionNum,
      notes: cmd.notes,
      snapshot,
      result,
    });

    scenario.addVersion(version);
    await this.scenarioRepo.save(scenario);

    return scenario.id;
  }
}

export interface CalculateBenchmarksCommand {
  tenantId: string;
  examProfileCode: string;
  cohortAverages: Record<string, number>;
  cohortCounts: Record<string, number>;
  instructorAverages: Record<string, number>;
  instructorCounts: Record<string, number>;
  pathwayAverages: Record<string, number>;
}

export class CalculateBenchmarksHandler {
  private readonly benchmarkEngine = new InstitutionalBenchmarkEngine();

  constructor(private readonly benchmarkRepo: BenchmarkRepository) {}

  public async execute(cmd: CalculateBenchmarksCommand): Promise<string | null> {
    const benchmark = this.benchmarkEngine.computeBenchmarks({
      tenantId: cmd.tenantId,
      examProfileCode: cmd.examProfileCode,
      cohortAverages: cmd.cohortAverages,
      cohortCounts: cmd.cohortCounts,
      instructorAverages: cmd.instructorAverages,
      instructorCounts: cmd.instructorCounts,
      pathwayAverages: cmd.pathwayAverages,
    });

    if (!benchmark) return null; // Anonymization lock threshold failed
    await this.benchmarkRepo.save(benchmark);
    return benchmark.id;
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 3: QUERY HANDLERS
// ───────────────────────────────────────────────────────────────────

export class GetTimelineHandler {
  constructor(
    private readonly timelineRepo: ReadinessTimelineRepository,
    private readonly snapshotRepo: ReadinessStateSnapshotRepository
  ) {}

  public async execute(studentId: string, profileId: string): Promise<ReadinessTimeline | null> {
    const timeline = await this.timelineRepo.findByStudent(studentId, profileId);
    if (!timeline) return null;

    const snapshots = await this.snapshotRepo.findByTimeline(timeline.id);
    snapshots.forEach((s) => {
      // Re-add to timeline in memory if not already present
      if (!timeline.snapshots.some((existing) => existing.id === s.id)) {
        timeline.addSnapshot(s);
      }
    });

    return timeline;
  }
}

export class GetPredictionStabilityHandler {
  constructor(private readonly stabilityRepo: PredictionStabilityRepository) {}

  public async execute(studentId: string, profileId: string): Promise<PredictionStability | null> {
    return this.stabilityRepo.findByStudent(studentId, profileId);
  }
}

export class GetSkillContributionHandler {
  private readonly contributionEngine = new SkillContributionEngine();
  private readonly explanationEngine = new ReadinessExplanationEngine();

  constructor(private readonly snapshotRepo: ReadinessStateSnapshotRepository) {}

  public async execute(studentId: string): Promise<{
    contributions: SkillContribution[];
    explanation: { explanationText: string; priorityFocus: string[]; advice: string };
  } | null> {
    const latestSnapshot = await this.snapshotRepo.findById(studentId); // Find by id or query
    if (!latestSnapshot) return null;

    const contributions = this.contributionEngine.calculateContributions(
      latestSnapshot.competencyMastery
    );
    const explanation = this.explanationEngine.generateExplanation(contributions);

    return { contributions, explanation };
  }
}

export class GetScenarioProjectionHandler {
  constructor(private readonly scenarioRepo: ScenarioRepository) {}

  public async execute(studentId: string): Promise<TargetScenario[]> {
    return this.scenarioRepo.findByStudent(studentId);
  }
}

export class GetBenchmarkHandler {
  constructor(private readonly benchmarkRepo: BenchmarkRepository) {}

  public async execute(examProfileCode: string): Promise<InstitutionalBenchmark | null> {
    return this.benchmarkRepo.findByExam(examProfileCode);
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 4: APPLICATION ORCHESTRATORS
// ───────────────────────────────────────────────────────────────────

export class ReadinessAnalyticsOrchestrator {
  private readonly timelineEngine = new ReadinessTimelineEngine();

  constructor(
    private readonly timelineRepo: ReadinessTimelineRepository,
    private readonly snapshotRepo: ReadinessStateSnapshotRepository
  ) {}

  public async processTimelineAnalytics(
    studentId: string,
    profileId: string
  ): Promise<TimelineTrend | null> {
    const timeline = await this.timelineRepo.findByStudent(studentId, profileId);
    if (!timeline) return null;

    const snapshots = await this.snapshotRepo.findByTimeline(timeline.id);
    if (snapshots.length === 0) return null;

    const trend = this.timelineEngine.calculateTrend(snapshots);
    timeline.addTrend(trend);
    await this.timelineRepo.save(timeline);

    return trend;
  }
}

export class ScenarioPlanningOrchestrator {
  constructor(private readonly scenarioRepo: ScenarioRepository) {}

  public async getProjections(studentId: string): Promise<ScenarioProjectionView[]> {
    const scenarios = await this.scenarioRepo.findByStudent(studentId);
    const projections: ScenarioProjectionView[] = [];

    scenarios.forEach((s) => {
      s.versions.forEach((v) => {
        projections.push({
          scenarioName: s.scenarioNameVal,
          versionNumber: v.versionNumber,
          projectedReadiness: v.result.projectedReadiness.value,
          predictedOfficialScore: v.result.predictedOfficialScore,
          estimatedAchievementDate: v.result.estimatedAchievementDate.date,
          goalProbability: v.result.goalProbability.probability,
          notes: v.notes,
        });
      });
    });

    return projections;
  }
}

export class InstitutionalBenchmarkOrchestrator {
  constructor(private readonly benchmarkRepo: BenchmarkRepository) {}

  public async getBenchmarkView(examProfileCode: string): Promise<InstitutionBenchmarkView | null> {
    const benchmark = await this.benchmarkRepo.findByExam(examProfileCode);
    if (!benchmark) return null;

    return {
      examProfileCode: benchmark.examProfileCode,
      avgReadinessScore: benchmark.avgReadinessScore,
      totalStudents: benchmark.totalStudentCount,
      distribution: benchmark.readinessDistribution,
      forecast: benchmark.successForecast,
      cohortsRankings: benchmark.cohorts.map((c) => ({
        cohortCode: c.cohortCode,
        avgReadiness: c.avgReadinessScore,
        expectedRank: c.expectedRank ?? 'N/A',
      })),
    };
  }
}
