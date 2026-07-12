import { describe, test, expect } from 'vitest';
import { Entity } from './index';

class MockEntity extends Entity<string> {}

describe('Kernel Entity Unit Tests', () => {
  test('Entities with same ID are equal', () => {
    const e1 = new MockEntity('123');
    const e2 = new MockEntity('123');
    expect(e1.equals(e2)).toBe(true);
  });

  test('Entities with different ID are not equal', () => {
    const e1 = new MockEntity('123');
    const e2 = new MockEntity('456');
    expect(e1.equals(e2)).toBe(false);
  });
});
