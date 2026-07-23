import { describe, it, expect, vi } from 'vitest';
import {
  RecordReadinessSnapshotHandler,
  UpdatePredictionStabilityHandler,
  GenerateScenarioHandler,
  CalculateBenchmarksHandler,
  type ReadinessTimelineRepository,
  type ReadinessStateSnapshotRepository,
  type PredictionStabilityRepository,
  type ScenarioRepository,
  type BenchmarkRepository,
} from './addendum';
import {
  ReadinessTimeline,
  ReadinessStateSnapshot,
  PredictionStability,
  ReadinessScoreVO,
  StabilityIndex,
  PredictionVariance,
} from '@clasptek/domain-prediction-engine';

describe('Readiness & Prediction Enhancements Application Layer Units', () => {
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const studentId = 'student-abc';
  const profileId = 'profile-xyz';

  // Mock repos
  const mockTimelineRepo: ReadinessTimelineRepository = {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    findByStudent: vi.fn(
      async () =>
        new ReadinessTimeline({
          id: 'timeline-1',
          tenantId,
          studentId,
          profileId,
        })
    ),
  };

  const mockSnapshotRepo: ReadinessStateSnapshotRepository = {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    findByTimeline: vi.fn(async () => [
      new ReadinessStateSnapshot({
        id: 'snap-1',
        tenantId,
        timelineId: 'timeline-1',
        studentId,
        profileId,
        readinessScore: new ReadinessScoreVO(60),
        createdBy: 'user-1',
      }),
      new ReadinessStateSnapshot({
        id: 'snap-2',
        tenantId,
        timelineId: 'timeline-1',
        studentId,
        profileId,
        readinessScore: new ReadinessScoreVO(75),
        createdBy: 'user-1',
      }),
    ]),
  };

  const mockStabilityRepo: PredictionStabilityRepository = {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    findByStudent: vi.fn(
      async () =>
        new PredictionStability({
          id: 'stab-1',
          tenantId,
          studentId,
          profileId,
          stabilityScore: new StabilityIndex(85),
          variance: new PredictionVariance(1.5),
          volatilityState: 'STABLE',
          confidenceTrend: 'STABLE',
        })
    ),
  };

  const mockScenarioRepo: ScenarioRepository = {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    findByStudent: vi.fn(async () => []),
  };

  const mockBenchmarkRepo: BenchmarkRepository = {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    findByExam: vi.fn(async () => null),
  };

  it('can record snapshots successfully via RecordReadinessSnapshotHandler', async () => {
    const handler = new RecordReadinessSnapshotHandler(mockTimelineRepo, mockSnapshotRepo);
    const snapId = await handler.execute({
      tenantId,
      studentId,
      profileId,
      readinessScore: 80,
      competencyMastery: { reading: 85, writing: 75 },
      learnerState: {},
      practiceStatistics: {},
      studyStreak: {},
      createdBy: 'user-1',
    });

    expect(snapId).toBeDefined();
    expect(mockSnapshotRepo.save).toHaveBeenCalled();
  });

  it('can update stability metrics via UpdatePredictionStabilityHandler', async () => {
    const handler = new UpdatePredictionStabilityHandler(mockStabilityRepo);
    const stabId = await handler.execute({
      tenantId,
      studentId,
      profileId,
      recentScores: [70, 72, 71],
      learningVelocity: 0.5,
      mockScores: [7.0],
      practiceCount: 30,
    });

    expect(stabId).toBeDefined();
    expect(mockStabilityRepo.save).toHaveBeenCalled();
  });

  it('can plan target scenarios via GenerateScenarioHandler', async () => {
    const handler = new GenerateScenarioHandler(mockScenarioRepo);
    const scenarioId = await handler.execute({
      tenantId,
      studentId,
      scenarioName: 'IELTS Success Plan',
      scenarioCode: 'WRITING_IMPROVEMENT',
      currentReadiness: 65,
      hoursSimulated: 4,
    });

    expect(scenarioId).toBeDefined();
    expect(mockScenarioRepo.save).toHaveBeenCalled();
  });

  it('can run cohort aggregations and peer ranks via InstitutionalBenchmarkOrchestrator', async () => {
    const handler = new CalculateBenchmarksHandler(mockBenchmarkRepo);
    const result = await handler.execute({
      tenantId,
      examProfileCode: 'IELTS_ACADEMIC',
      cohortAverages: { C1: 80.0, C2: 85.0 },
      cohortCounts: { C1: 10, C2: 12 },
      instructorAverages: { I1: 82.0 },
      instructorCounts: { I1: 22 },
      pathwayAverages: { P1: 81.0 },
    });

    expect(result).toBeDefined();
    expect(mockBenchmarkRepo.save).toHaveBeenCalled();
  });
});
