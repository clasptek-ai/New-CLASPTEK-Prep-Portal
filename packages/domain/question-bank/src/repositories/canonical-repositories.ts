import { QuestionPackage } from '../aggregates/question-package.aggregate';
import { Passage } from '../aggregates/passage.aggregate';
import { MediaAsset } from '../aggregates/media-asset.aggregate';
import { PracticeAssessment } from '../aggregates/practice-assessment.aggregate';
import { MockAssessment } from '../aggregates/mock-assessment.aggregate';

export interface QuestionPackageRepository {
  save(pkg: QuestionPackage): Promise<void>;
  findById(id: string): Promise<QuestionPackage | null>;
  findByCode(code: string): Promise<QuestionPackage | null>;
  findAll(tenantId: string): Promise<QuestionPackage[]>;
  nextIdentity(): string;
}

export interface PassageRepository {
  save(passage: Passage): Promise<void>;
  findById(id: string): Promise<Passage | null>;
  findByCode(code: string): Promise<Passage | null>;
  findAll(tenantId: string): Promise<Passage[]>;
  nextIdentity(): string;
}

export interface MediaAssetRepository {
  save(asset: MediaAsset): Promise<void>;
  findById(id: string): Promise<MediaAsset | null>;
  findByChecksum(checksum: string): Promise<MediaAsset | null>;
  findAll(tenantId: string): Promise<MediaAsset[]>;
  nextIdentity(): string;
}

export interface PracticeAssessmentRepository {
  save(assessment: PracticeAssessment): Promise<void>;
  findById(id: string): Promise<PracticeAssessment | null>;
  findBySkill(skillId: string): Promise<PracticeAssessment[]>;
  findAll(tenantId: string): Promise<PracticeAssessment[]>;
  nextIdentity(): string;
}

export interface MockAssessmentRepository {
  save(assessment: MockAssessment): Promise<void>;
  findById(id: string): Promise<MockAssessment | null>;
  findByBlueprint(blueprintId: string): Promise<MockAssessment[]>;
  findAll(tenantId: string): Promise<MockAssessment[]>;
  nextIdentity(): string;
}
