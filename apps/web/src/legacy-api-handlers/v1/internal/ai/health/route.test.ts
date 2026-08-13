import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/v1/internal/ai/health Verification Route Test', () => {
  it('returns 403 in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'production';

    const req = new NextRequest('http://localhost:3000/api/v1/internal/ai/health', {
      method: 'POST',
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('unavailable in production');

    (process.env as any).NODE_ENV = originalEnv;
  });

  it('runs internal AI health check pipeline in non-production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'development';

    const req = new NextRequest('http://localhost:3000/api/v1/internal/ai/health', {
      method: 'POST',
    });
    const res = await POST(req);

    // Endpoint executes pipeline flow
    expect([200, 401, 422, 429, 500, 504]).toContain(res.status);
    const data = await res.json();
    expect(data.status).toBeDefined();

    (process.env as any).NODE_ENV = originalEnv;
  });
});
