import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getTimeline, POST as postTimeline } from './timeline/route';
import { GET as getStability } from './stability/route';
import { GET as getContribution } from './contribution/route';
import { GET as getScenario, POST as postScenario } from './scenario/route';
import { GET as getConfidence } from './confidence/route';
import { GET as getBenchmark } from './benchmark/route';

// Mock auth utilities
vi.mock('@/lib/auth-util', () => ({
  getAuthenticatedSession: vi.fn(async () => ({ userId: 'student-abc' })),
}));

// Mock DI context
vi.mock('@/lib/prediction-engine-context', () => ({
  getPredictionEngineContext: vi.fn(async () => ({
    getTimeline: { execute: vi.fn(async () => ({ id: 'timeline-1', snapshots: [] })) },
    timelineOrchestrator: {
      processTimelineAnalytics: vi.fn(async () => ({ trendDirection: { value: 'ACCELERATING' } })),
    },
    recordReadinessSnapshot: { execute: vi.fn(async () => 'snap-id-123') },
    updatePredictionStability: { execute: vi.fn(async () => 'stability-id-123') },
    getPredictionStability: { execute: vi.fn(async () => ({ stabilityScore: { score: 90 } })) },
    getSkillContribution: { execute: vi.fn(async () => ({ contributions: [], explanation: {} })) },
    scenarioOrchestrator: { getProjections: vi.fn(async () => []) },
    generateScenario: { execute: vi.fn(async () => 'scenario-id-123') },
    calculateBenchmarks: { execute: vi.fn(async () => 'benchmark-id-123') },
    benchmarkOrchestrator: { getBenchmarkView: vi.fn(async () => ({ avgReadinessScore: 82.5 })) },
    getBenchmark: { execute: vi.fn(async () => ({ cohorts: [], instructors: [], pathways: [] })) },
  })),
}));

describe('Readiness & Prediction Enhancements API Routes', () => {
  it('handles GET timeline route request', async () => {
    const req = new Request('http://localhost/api/v1/readiness/timeline') as unknown as NextRequest;
    const res = await getTimeline(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.timeline).toBeDefined();
  });

  it('handles POST timeline route request', async () => {
    const req = new Request('http://localhost/api/v1/readiness/timeline', {
      method: 'POST',
      body: JSON.stringify({ readinessScore: 82 }),
    }) as unknown as NextRequest;
    const res = await postTimeline(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.snapshotId).toBe('snap-id-123');
  });

  it('handles GET stability route request', async () => {
    const req = new Request(
      'http://localhost/api/v1/readiness/stability'
    ) as unknown as NextRequest;
    const res = await getStability(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stability).toBeDefined();
  });

  it('handles GET contribution route request', async () => {
    const req = new Request(
      'http://localhost/api/v1/readiness/contribution'
    ) as unknown as NextRequest;
    const res = await getContribution(req);
    const body = await res.json();
    expect(res.status).toBe(200);
  });

  it('handles GET scenario route request', async () => {
    const req = new Request('http://localhost/api/v1/readiness/scenario') as unknown as NextRequest;
    const res = await getScenario(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.projections).toBeDefined();
  });

  it('handles POST scenario route request', async () => {
    const req = new Request('http://localhost/api/v1/readiness/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenarioName: 'Test Target Score', scenarioCode: 'MOCK_EXAMS' }),
    }) as unknown as NextRequest;
    const res = await postScenario(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.scenarioId).toBe('scenario-id-123');
  });

  it('handles GET confidence report request', async () => {
    const req = new Request(
      'http://localhost/api/v1/readiness/confidence'
    ) as unknown as NextRequest;
    const res = await getConfidence(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.report).toBeDefined();
  });

  it('handles GET benchmarks request', async () => {
    const req = new Request(
      'http://localhost/api/v1/readiness/benchmark'
    ) as unknown as NextRequest;
    const res = await getBenchmark(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.benchmark.avgReadinessScore).toBe(82.5);
  });
});
