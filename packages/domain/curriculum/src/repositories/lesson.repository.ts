import { Lesson } from '../aggregates/lesson.aggregate';

export interface LessonRepository {
  findById(id: string): Promise<Lesson | null>;
  findByModule(learningModuleId: string): Promise<Lesson[]>;
  save(lesson: Lesson): Promise<void>;
  delete(id: string): Promise<void>;
}
