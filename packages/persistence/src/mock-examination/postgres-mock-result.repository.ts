import { MockResult, MockResultRepositoryContract } from '@clasptek/domain-mock-examination';

export class PostgresMockResultRepository implements MockResultRepositoryContract {
  private results = new Map<string, MockResult>();

  public async save(result: MockResult): Promise<void> {
    this.results.set(result.id, result);
  }

  public async findBySessionId(sessionId: string): Promise<MockResult | null> {
    return Array.from(this.results.values()).find((r) => r.sessionId === sessionId) || null;
  }

  public async findByStudentId(studentId: string): Promise<MockResult[]> {
    return Array.from(this.results.values()).filter((r) => r.studentId === studentId);
  }
}
