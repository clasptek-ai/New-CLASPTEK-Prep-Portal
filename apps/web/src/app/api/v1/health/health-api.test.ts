import { describe, it, expect, vi } from 'vitest';
import { GET as getHealth } from './route';
import { NextRequest } from 'next/server';

vi.mock('@clasptek/persistence', () => {
  return {
    DatabasePool: vi.fn().mockImplementation(() => ({
      query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    })),
  };
});

describe('GET /api/v1/health Readiness Probe Route Test', () => {
  it('returns HTTP 200 and healthy status payload', async () => {
    const req = new NextRequest('http://localhost/api/v1/health');
    const res = await getHealth(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.platformVersion).toBe('v4.0.1-production-ready');
    expect(body.checks.database.status).toBe('healthy');
    expect(body.checks.memory.heapUsedMb).toBeGreaterThan(0);
  });
});
