import { Passage, ExamType, SectionType } from '../../services/admin/questions.service';

export interface IPassageRepository {
  findAll(): Promise<Passage[]>;
  findById(id: string): Promise<Passage | null>;
  findByExamAndSection(exam?: ExamType, section?: SectionType): Promise<Passage[]>;
  save(passage: Passage): Promise<Passage>;
  delete(id: string): Promise<boolean>;
}
