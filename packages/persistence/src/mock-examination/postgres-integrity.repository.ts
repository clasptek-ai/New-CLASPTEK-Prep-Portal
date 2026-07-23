import { IntegrityRepositoryContract } from '@clasptek/domain-mock-examination';

export interface IntegrityLogRecord {
  sessionId: string;
  type: string;
  details: string;
  loggedAt: Date;
}

export class PostgresIntegrityRepository implements IntegrityRepositoryContract {
  private logs: IntegrityLogRecord[] = [];

  public async logViolation(sessionId: string, type: string, details: string): Promise<void> {
    this.logs.push({ sessionId, type, details, loggedAt: new Date() });
  }

  public async getWarningCount(sessionId: string): Promise<number> {
    return this.logs.filter((l) => l.sessionId === sessionId).length;
  }
}
