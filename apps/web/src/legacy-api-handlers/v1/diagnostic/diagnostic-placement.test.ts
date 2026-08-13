import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });

import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';

describe('Diagnostic Placement Endpoints Integration Tests', () => {
  it('should run a complete diagnostic attempt session sequentially', async () => {
    const context = await getDiagnosticContext();
    const studentId = randomUUID();
    const catalogId = 'd0000000-0000-0000-0000-000000000001';
    const formId = 'd0000000-0000-0000-0000-000000000101';
    const attemptId = randomUUID();

    // 1. Start Attempt
    await context.startAttemptHandler.execute({
      id: attemptId,
      studentId,
      catalogId,
      tenantId: '00000000-0000-0000-0000-000000000000',
    });

    // 2. Submit Responses (Low, Medium, High indices)
    await context.submitResponseHandler.execute({
      id: randomUUID(),
      attemptId,
      questionId: randomUUID(),
      questionVersionId: randomUUID(),
      payload: { option: 'A' },
      isCorrect: true, // correct
      timeSpentMs: 1500,
    });

    await context.submitResponseHandler.execute({
      id: randomUUID(),
      attemptId,
      questionId: randomUUID(),
      questionVersionId: randomUUID(),
      payload: { option: 'B' },
      isCorrect: false, // incorrect
      timeSpentMs: 2000,
    });

    await context.submitResponseHandler.execute({
      id: randomUUID(),
      attemptId,
      questionId: randomUUID(),
      questionVersionId: randomUUID(),
      payload: { option: 'C' },
      isCorrect: true, // correct
      timeSpentMs: 1200,
    });

    // 3. Calculate Placement
    const placementId = await context.calculatePlacementHandler.execute({
      attemptId,
      formId,
    });

    expect(placementId).toBeDefined();

    // 4. Verify Database Records
    const pool: Pool = context.dbPool.getPool();
    const attemptRes = await pool.query('SELECT * FROM public.diagnostic_attempts WHERE id = $1', [
      attemptId,
    ]);
    expect(attemptRes.rows.length).toBe(1);
    expect(attemptRes.rows[0].status).toBe('SUBMITTED');

    const placementRes = await pool.query('SELECT * FROM public.placement_results WHERE id = $1', [
      placementId,
    ]);
    expect(placementRes.rows.length).toBe(1);
    expect(placementRes.rows[0].placement_stage).toBe('Intermediate'); // 2/3 = 66.6% -> Intermediate stage
    expect(parseFloat(placementRes.rows[0].reliability_score)).toBe(15.0); // 3 responses * 5 = 15
  });
});
