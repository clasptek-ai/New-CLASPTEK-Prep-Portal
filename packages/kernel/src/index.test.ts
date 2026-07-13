import { describe, test, expect } from 'vitest';
import { Entity, SystemClock, TestClock, ValidationError } from './index';

class MockEntity extends Entity<string> {}

describe('Kernel Primitives Unit Tests', () => {
  test('Entities with same ID are equal', () => {
    const e1 = new MockEntity('123');
    const e2 = new MockEntity('123');
    expect(e1.equals(e2)).toBe(true);
  });

  test('Clock returns current system date', () => {
    const systemClock = new SystemClock();
    const before = new Date();
    const time = systemClock.now();
    const after = new Date();
    expect(time.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(time.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  test('TestClock returns fixed date and advances', () => {
    const fixed = new Date('2026-07-12T00:00:00.000Z');
    const testClock = new TestClock(fixed);
    expect(testClock.now().toISOString()).toBe('2026-07-12T00:00:00.000Z');

    testClock.advanceByMs(1000);
    expect(testClock.now().toISOString()).toBe('2026-07-12T00:00:01.000Z');
  });

  test('ApplicationError hides stack trace in production', () => {
    const err = new ValidationError('Invalid name', 'corr-123', { name: 'invalid' });
    const serializedProd = err.serialize('production');
    expect(serializedProd.code).toBe('VALIDATION_ERROR');
    expect(serializedProd.message).toBe('Invalid name');
    expect(serializedProd.correlationId).toBe('corr-123');
    expect(serializedProd.diagnostics).toEqual({ name: 'invalid' });
    expect(serializedProd.stack).toBeUndefined();

    const serializedDev = err.serialize('development');
    expect(serializedDev.stack).toBeDefined();
  });
});
