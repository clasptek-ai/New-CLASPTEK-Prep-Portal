import { CurriculumVersion } from '../aggregates/curriculum-version.aggregate';

export interface CurriculumVersionRepository {
  findById(id: string): Promise<CurriculumVersion | null>;
  findByCurriculumAndVersion(curriculumId: string, versionNo: string): Promise<CurriculumVersion | null>;
  save(version: CurriculumVersion): Promise<void>;
  delete(id: string): Promise<void>;
}
