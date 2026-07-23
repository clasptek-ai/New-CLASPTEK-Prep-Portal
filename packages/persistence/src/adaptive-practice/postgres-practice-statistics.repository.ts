import { DatabasePool } from '../database-pool';
import {
  PracticeStatisticsRecord,
  PracticeStatisticsRepository,
} from '@clasptek/domain-adaptive-practice';

export class PostgresPracticeStatisticsRepository implements PracticeStatisticsRepository {
  private inMemoryStore = new Map<string, PracticeStatisticsRecord>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(stats: PracticeStatisticsRecord): Promise<void> {
    this.inMemoryStore.set(stats.studentId, stats);
  }

  public async findByStudentId(studentId: string): Promise<PracticeStatisticsRecord | null> {
    return this.inMemoryStore.get(studentId) || null;
  }
}
