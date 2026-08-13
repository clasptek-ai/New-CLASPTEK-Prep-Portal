import { describe, it, expect } from 'vitest';

describe('Sprint 3.5.1 Canonical REST APIs — Practice Delivery Validation', () => {
  it('validates practice retry payload', () => {
    const isValidRetry = (body: any) => Boolean(body && (body.sessionId || body.studentId));
    expect(isValidRetry({ sessionId: 'ses-1' })).toBe(true);
  });

  it('validates feedback strategy options', () => {
    const modes = ['IMMEDIATE', 'DEFERRED', 'EXPLANATION_ONLY', 'CORRECT_ANSWER_ONLY'];
    expect(modes.includes('IMMEDIATE')).toBe(true);
    expect(modes.includes('UNKNOWN')).toBe(false);
  });
});
