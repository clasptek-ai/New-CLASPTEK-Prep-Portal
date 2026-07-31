import { ExamType } from '../../services/admin/questions.service';

export interface WritingTask {
  id: string;
  code: string;
  examType: ExamType;
  taskNumber: number; // 1 or 2
  title: string;
  prompt: string;
  instructions: string;
  minWords: number;
  maxWords?: number;
  timeRecommendedMinutes: number;
  modelAnswer?: string;
  createdAt: string;
}

export interface IWritingTaskRepository {
  findAll(): Promise<WritingTask[]>;
  findById(id: string): Promise<WritingTask | null>;
  findByExam(exam?: ExamType): Promise<WritingTask[]>;
  save(task: WritingTask): Promise<WritingTask>;
  delete(id: string): Promise<boolean>;
}
