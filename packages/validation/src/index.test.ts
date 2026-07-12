import { describe, test, expect } from 'vitest';
import { emailSchema } from './index';

describe('Validation Primitives Unit Tests', () => {
  test('Valid email passes', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
  });

  test('Invalid email fails', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
  });
});
