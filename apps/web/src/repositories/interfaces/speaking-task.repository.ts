import { ExamType } from '../../services/admin/questions.service';

export interface SpeakingTask {
  id: string;
  code: string;
  examType: ExamType;
  partNumber: number; // 1, 2, or 3
  title: string;
  prompt: string;
  preparationSeconds: number;
  responseSeconds: number;
  audioPromptUrl?: string;
  cueCardBulletPoints?: string[];
  createdAt: string;
}

export interface ISpeakingTaskRepository {
  findAll(): Promise<SpeakingTask[]>;
  findById(id: string): Promise<SpeakingTask | null>;
  findByExam(exam?: ExamType): Promise<SpeakingTask[]>;
  save(task: SpeakingTask): Promise<SpeakingTask>;
  delete(id: string): Promise<boolean>;
}
