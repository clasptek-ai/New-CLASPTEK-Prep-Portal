import { Lesson } from '../aggregates/lesson.aggregate';

export interface LessonRepository {
  save(lesson: Lesson): Promise<void>;
  findById(id: string): Promise<Lesson | null>;
  findByCode(code: string): Promise<Lesson | null>;
  exists(code: string): Promise<boolean>;
  search(filters: { moduleId?: string }): Promise<Lesson[]>;
  nextIdentity(): string;
}
