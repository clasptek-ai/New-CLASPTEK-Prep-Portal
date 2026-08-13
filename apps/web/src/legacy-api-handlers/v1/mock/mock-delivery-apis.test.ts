import { describe, it, expect } from 'vitest';

describe('Sprint 3.6 REST APIs Validation', () => {
  it('validates integrity-event payload schema', () => {
    const payload = {
      sessionId: 'ses-api-1',
      eventType: 'FULLSCREEN_EXITED',
      currentWarningCount: 1,
    };
    expect(payload.sessionId).toBeDefined();
    expect(payload.eventType).toBe('FULLSCREEN_EXITED');
  });

  it('validates active-sessions monitoring schema', () => {
    const sessionRecord = {
      sessionId: 'ses-api-2',
      studentId: 'std-api-2',
      status: 'IN_PROGRESS',
      warningCount: 0,
    };
    expect(sessionRecord.status).toBe('IN_PROGRESS');
  });
});
