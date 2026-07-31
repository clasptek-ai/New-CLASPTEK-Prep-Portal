import { QuestionGroup } from '../../services/admin/questions.service';

export interface IQuestionGroupRepository {
  findAll(): Promise<QuestionGroup[]>;
  findById(id: string): Promise<QuestionGroup | null>;
  findByPassageId(passageId: string): Promise<QuestionGroup[]>;
  save(group: QuestionGroup): Promise<QuestionGroup>;
  delete(id: string): Promise<boolean>;
}
