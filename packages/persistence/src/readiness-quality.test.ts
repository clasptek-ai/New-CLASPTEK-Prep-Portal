import { describe, it, expect, vi } from 'vitest';
import {
  PostgresReadinessTimelineRepository,
  PostgresReadinessStateSnapshotRepository,
  PostgresPredictionStabilityRepository,
  PostgresScenarioRepository,
  PostgresBenchmarkRepository,
} from './index';
import {
  ReadinessTimeline,
  ReadinessStateSnapshot,
  PredictionStability,
  TargetScenario,
  InstitutionalBenchmark,
  ReadinessScoreVO,
  StabilityIndex,
  PredictionVariance,
  CohortBenchmark,
} from '@clasptek/domain-prediction-engine';
import { randomUUID } from 'crypto';

describe('Readiness & Prediction Enhancements Persistence Layer Tests', () => {
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const studentId = 'student-123';
  const profileId = 'profile-987';

  // Mock Database Pool
  const mockQuery = vi.fn(async () => ({ rows: [] as any[] }));
  const mockDbPool = {
    getPool: () => ({
      query: mockQuery,
    }),
  } as any;

  it('can save ReadinessTimeline in PostgresReadinessTimelineRepository', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const repo = new PostgresReadinessTimelineRepository(mockDbPool);

    const timeline = new ReadinessTimeline({
      id: randomUUID(),
      tenantId,
      studentId,
      profileId,
    });

    await repo.save(timeline);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('can save ReadinessSnapshot in PostgresReadinessStateSnapshotRepository', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const repo = new PostgresReadinessStateSnapshotRepository(mockDbPool);

    const snapshot = new ReadinessStateSnapshot({
      id: randomUUID(),
      tenantId,
      timelineId: randomUUID(),
      studentId,
      profileId,
      readinessScore: new ReadinessScoreVO(85),
      createdBy: 'user-1',
    });

    await repo.save(snapshot);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('can save PredictionStability in PostgresPredictionStabilityRepository', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const repo = new PostgresPredictionStabilityRepository(mockDbPool);

    const stability = new PredictionStability({
      id: randomUUID(),
      tenantId,
      studentId,
      profileId,
      stabilityScore: new StabilityIndex(92),
      variance: new PredictionVariance(0.75),
      volatilityState: 'STABLE',
      confidenceTrend: 'STABLE',
    });

    await repo.save(stability);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('can save TargetScenario in PostgresScenarioRepository', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const repo = new PostgresScenarioRepository(mockDbPool);

    const scenario = new TargetScenario({
      id: randomUUID(),
      tenantId,
      studentId,
      scenarioName: 'Test Simulation Scenario',
    });

    await repo.save(scenario);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('can save InstitutionalBenchmark in PostgresBenchmarkRepository', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const repo = new PostgresBenchmarkRepository(mockDbPool);

    const benchmark = new InstitutionalBenchmark({
      id: randomUUID(),
      tenantId,
      examProfileCode: 'IELTS_ACADEMIC',
      avgReadinessScore: 78.5,
      totalStudentCount: 45,
    });
    benchmark.addCohort(
      new CohortBenchmark({
        id: randomUUID(),
        cohortCode: 'C1',
        avgReadinessScore: 80,
        percentileRank: 90,
      })
    );

    await repo.save(benchmark);
    expect(mockQuery).toHaveBeenCalled();
  });
});
