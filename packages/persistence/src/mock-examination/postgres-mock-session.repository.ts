import { MockSession, MockSessionRepositoryContract } from '@clasptek/domain-mock-examination';

export class PostgresMockSessionRepository implements MockSessionRepositoryContract {
  private sessions = new Map<string, MockSession>();

  public async save(session: MockSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  public async findById(id: string): Promise<MockSession | null> {
    return this.sessions.get(id) || null;
  }

  public async findByStudentId(studentId: string): Promise<MockSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.studentId === studentId);
  }
}
