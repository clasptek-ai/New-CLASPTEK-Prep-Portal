import { Curriculum } from '../aggregates/curriculum.aggregate';
import { CurriculumCode } from '../value-objects/curriculum-code.vo';

export interface CurriculumRepository {
  findById(id: string): Promise<Curriculum | null>;
  findByCode(code: CurriculumCode): Promise<Curriculum | null>;
  save(curriculum: Curriculum): Promise<void>;
  delete(id: string): Promise<void>;
  search(filters: any): Promise<Curriculum[]>;
}
