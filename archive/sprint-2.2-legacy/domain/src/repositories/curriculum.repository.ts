import { Curriculum } from '../aggregates/curriculum.aggregate';
import { Programme } from '../aggregates/programme.aggregate';
import { CurriculumVersion } from '../entities/curriculum-version.entity';
import { ProgrammeVersion } from '../entities/programme-version.entity';

export interface SearchFilters {
  examProduct?: string;
  examBoard?: string;
  programme?: string;
  status?: string;
  version?: string;
  country?: string;
  language?: string;
  deliveryMode?: string;
  effectiveDate?: string;
  code?: string;
}

export interface CurriculumRepository {
  findById(id: string): Promise<Curriculum | null>;
  findByCode(code: string): Promise<Curriculum | null>;
  save(curriculum: Curriculum): Promise<void>;
  exists(code: string): Promise<boolean>;
  findPublished(id: string): Promise<CurriculumVersion | null>;
  findVersion(id: string, versionNo: string): Promise<CurriculumVersion | null>;
  search(filters: SearchFilters): Promise<Curriculum[]>;
  nextIdentity(): string;
}

export interface ProgrammeRepository {
  findById(id: string): Promise<Programme | null>;
  findByCode(code: string): Promise<Programme | null>;
  save(programme: Programme): Promise<void>;
  exists(code: string): Promise<boolean>;
  findPublished(id: string): Promise<ProgrammeVersion | null>;
  search(filters: SearchFilters): Promise<Programme[]>;
  nextIdentity(): string;
}
