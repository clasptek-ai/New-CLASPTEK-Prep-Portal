import { describe, test, expect, vi } from 'vitest';
import { GET as getMetrics } from './metrics/route';
import { GET as getCatalog } from './catalog/route';
import { GET as getWarehouse, POST as buildWarehouse } from './warehouse/route';
import { GET as getDataQuality } from './data-quality/route';
import { POST as requestResearchExport } from './export/research/route';
import { GET as getExecutive } from './executive/route';
import { GET as getBenchmarks } from './benchmarks/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/learning-analytics-context', () => {
  return {
    getLearningAnalyticsContext: async () => ({
      getMetricCatalog: {
        execute: async () => [{ code: { value: 'RETENTION_RATE' }, name: 'Retention Rate' }],
        executeByCode: async (code: string) =>
          code === 'RETENTION_RATE'
            ? { code: { value: 'RETENTION_RATE' }, name: 'Retention Rate' }
            : null,
      },
      warehouseService: {
        getLatestSnapshot: async () => ({
          id: 'snap-1',
          warehouseVersion: 'wh-v2.1.1-100',
          generatedAt: new Date().toISOString(),
        }),
        buildWarehouseSnapshot: async () => ({
          id: 'snap-2',
          warehouseVersion: 'wh-v2.1.1-101',
          generatedAt: new Date().toISOString(),
        }),
      },
      qualityMonitorEngine: {
        runQualityScan: async () => [],
      },
      researchExportPipeline: {
        requestExport: async (params: any) => ({
          id: 'exp-1',
          requestedBy: params.requestedBy,
          datasetType: params.datasetType,
          status: 'REQUESTED',
        }),
        processExportJob: async (id: string) => ({ id, status: 'READY' }),
      },
      getExplainableExecutiveInsights: {
        execute: async () => [
          {
            insight: { id: 'ins-1', title: 'Programme Readiness Acceleration' },
            primaryFinding: { id: 'find-1', topic: 'Readiness' },
          },
        ],
      },
      getInstitutionalBenchmarking: {
        execute: async (category: string) => ({
          category,
          institutionalAverage: 82.5,
          topDecileScore: 94.1,
          cohortPercentiles: [],
          computedAt: new Date().toISOString(),
        }),
      },
    }),
  };
});

describe('Sprint 2.11.1 Enterprise Analytics REST API Routes', () => {
  test('GET /api/v1/analytics/metrics returns metric catalog list', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analytics/metrics');
    const res = await getMetrics(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  test('GET /api/v1/analytics/metrics?code=RETENTION_RATE returns specific metric', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/v1/analytics/metrics?code=RETENTION_RATE'
    );
    const res = await getMetrics(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Retention Rate');
  });

  test('GET /api/v1/analytics/catalog returns full governance catalog', async () => {
    const res = await getCatalog();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.catalogName).toContain('Enterprise Institutional Metrics Catalog');
  });

  test('GET /api/v1/analytics/warehouse returns latest warehouse snapshot', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analytics/warehouse');
    const res = await getWarehouse(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.snapshot.warehouseVersion).toContain('wh-v2.1.1');
  });

  test('POST /api/v1/analytics/warehouse builds new warehouse snapshot', async () => {
    const res = await buildWarehouse();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('snap-2');
  });

  test('GET /api/v1/analytics/data-quality scans data pipelines and returns status', async () => {
    const res = await getDataQuality();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.overallStatus).toBe('VALID');
  });

  test('POST /api/v1/analytics/export/research creates research export job', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analytics/export/research', {
      method: 'POST',
      body: JSON.stringify({ requestedBy: 'lead-researcher', datasetType: 'READINESS' }),
    });
    const res = await requestResearchExport(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('REQUESTED');
  });

  test('GET /api/v1/analytics/executive returns explainable executive insights', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analytics/executive');
    const res = await getExecutive(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data[0].insight.title).toContain('Programme Readiness');
  });

  test('GET /api/v1/analytics/benchmarks returns institutional benchmarks', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/v1/analytics/benchmarks?category=READINESS_GROWTH'
    );
    const res = await getBenchmarks(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.institutionalAverage).toBe(82.5);
  });
});
