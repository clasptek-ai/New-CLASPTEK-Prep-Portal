import { DatabasePool } from '../database-pool';
import { PracticeBookmark, PracticeBookmarkRepository } from '@clasptek/domain-adaptive-practice';

export class PostgresPracticeBookmarkRepository implements PracticeBookmarkRepository {
  private inMemoryStore = new Map<string, PracticeBookmark>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(bookmark: PracticeBookmark): Promise<void> {
    this.inMemoryStore.set(bookmark.id, bookmark);
  }

  public async delete(studentId: string, questionId: string): Promise<void> {
    for (const [id, bmk] of this.inMemoryStore.entries()) {
      if (bmk.studentId === studentId && bmk.questionId === questionId) {
        this.inMemoryStore.delete(id);
        break;
      }
    }
  }

  public async findByStudentId(studentId: string): Promise<PracticeBookmark[]> {
    return Array.from(this.inMemoryStore.values()).filter((b) => b.studentId === studentId);
  }
}
