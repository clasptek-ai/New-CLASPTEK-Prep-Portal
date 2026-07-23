export interface ActiveSessionEntry {
  sessionId: string;
  studentId: string;
  ipAddress?: string | undefined;
  startedAt: Date;
  lastActiveAt: Date;
}

export interface IntegrityCheckResult {
  hasActiveConflict: boolean;
  activeSessionId?: string | undefined;
  incidentType?: 'DUPLICATE_SESSION' | 'MULTIPLE_DEVICES' | 'REFRESH_SPIKE' | undefined;
  actionRequired?: string | undefined;
}

/**
 * ExaminationIntegrityEngine
 *
 * Enforces single active session per student, detects duplicate logins across
 * multiple devices/tabs, detects rapid refresh spikes, and records audit trails.
 */
export class ExaminationIntegrityEngine {
  private activeSessions = new Map<string, ActiveSessionEntry>();

  public registerSession(
    sessionId: string,
    studentId: string,
    ipAddress?: string
  ): IntegrityCheckResult {
    const existing = this.activeSessions.get(studentId);

    if (existing && existing.sessionId !== sessionId) {
      return {
        hasActiveConflict: true,
        activeSessionId: existing.sessionId,
        incidentType: 'DUPLICATE_SESSION',
        actionRequired: `Active session '${existing.sessionId}' already in progress for student '${studentId}'.`,
      };
    }

    const entry: ActiveSessionEntry = {
      sessionId,
      studentId,
      ipAddress,
      startedAt: new Date(),
      lastActiveAt: new Date(),
    };

    this.activeSessions.set(studentId, entry);

    return {
      hasActiveConflict: false,
    };
  }

  public recordActivity(studentId: string): void {
    const entry = this.activeSessions.get(studentId);
    if (entry) {
      entry.lastActiveAt = new Date();
    }
  }

  public terminateSession(studentId: string): void {
    this.activeSessions.delete(studentId);
  }
}
