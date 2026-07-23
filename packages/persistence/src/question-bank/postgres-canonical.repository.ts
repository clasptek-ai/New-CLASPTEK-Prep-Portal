import { DatabasePool } from '../database-pool';

import {
  QuestionPackage,
  QuestionPackageRepository,
  Passage,
  PassageRepository,
  MediaAsset,
  MediaAssetRepository,
  PracticeAssessment,
  PracticeAssessmentRepository,
  MockAssessment,
  MockAssessmentRepository,
} from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

export class PostgresQuestionPackageRepository implements QuestionPackageRepository {
  private inMemoryStore = new Map<string, QuestionPackage>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(pkg: QuestionPackage): Promise<void> {
    this.inMemoryStore.set(pkg.id, pkg);
  }

  public async findById(id: string): Promise<QuestionPackage | null> {
    return this.inMemoryStore.get(id) || null;
  }

  public async findByCode(code: string): Promise<QuestionPackage | null> {
    for (const pkg of this.inMemoryStore.values()) {
      if (pkg.code === code) return pkg;
    }
    return null;
  }

  public async findAll(tenantId: string): Promise<QuestionPackage[]> {
    return Array.from(this.inMemoryStore.values()).filter((p) => p.tenantId === tenantId);
  }

  public nextIdentity(): string {
    return `pkg-${randomUUID()}`;
  }
}

export class PostgresPassageRepository implements PassageRepository {
  private inMemoryStore = new Map<string, Passage>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(passage: Passage): Promise<void> {
    this.inMemoryStore.set(passage.id, passage);
  }

  public async findById(id: string): Promise<Passage | null> {
    return this.inMemoryStore.get(id) || null;
  }

  public async findByCode(code: string): Promise<Passage | null> {
    for (const pas of this.inMemoryStore.values()) {
      if (pas.code === code) return pas;
    }
    return null;
  }

  public async findAll(tenantId: string): Promise<Passage[]> {
    return Array.from(this.inMemoryStore.values()).filter((p) => p.tenantId === tenantId);
  }

  public nextIdentity(): string {
    return `pas-${randomUUID()}`;
  }
}

export class PostgresMediaAssetRepository implements MediaAssetRepository {
  private inMemoryStore = new Map<string, MediaAsset>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(asset: MediaAsset): Promise<void> {
    this.inMemoryStore.set(asset.id, asset);
  }

  public async findById(id: string): Promise<MediaAsset | null> {
    return this.inMemoryStore.get(id) || null;
  }

  public async findByChecksum(checksum: string): Promise<MediaAsset | null> {
    for (const asset of this.inMemoryStore.values()) {
      if (asset.checksum === checksum) return asset;
    }
    return null;
  }

  public async findAll(tenantId: string): Promise<MediaAsset[]> {
    return Array.from(this.inMemoryStore.values()).filter((a) => a.tenantId === tenantId);
  }

  public nextIdentity(): string {
    return `med-${randomUUID()}`;
  }
}

export class PostgresPracticeAssessmentRepository implements PracticeAssessmentRepository {
  private inMemoryStore = new Map<string, PracticeAssessment>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(assessment: PracticeAssessment): Promise<void> {
    this.inMemoryStore.set(assessment.id, assessment);
  }

  public async findById(id: string): Promise<PracticeAssessment | null> {
    return this.inMemoryStore.get(id) || null;
  }

  public async findBySkill(skillId: string): Promise<PracticeAssessment[]> {
    return Array.from(this.inMemoryStore.values()).filter((pa) => pa.skillId === skillId);
  }

  public async findAll(tenantId: string): Promise<PracticeAssessment[]> {
    return Array.from(this.inMemoryStore.values()).filter((pa) => pa.tenantId === tenantId);
  }

  public nextIdentity(): string {
    return `pa-${randomUUID()}`;
  }
}

export class PostgresMockAssessmentRepository implements MockAssessmentRepository {
  private inMemoryStore = new Map<string, MockAssessment>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(assessment: MockAssessment): Promise<void> {
    this.inMemoryStore.set(assessment.id, assessment);
  }

  public async findById(id: string): Promise<MockAssessment | null> {
    return this.inMemoryStore.get(id) || null;
  }

  public async findByBlueprint(blueprintId: string): Promise<MockAssessment[]> {
    return Array.from(this.inMemoryStore.values()).filter((ma) => ma.blueprintId === blueprintId);
  }

  public async findAll(tenantId: string): Promise<MockAssessment[]> {
    return Array.from(this.inMemoryStore.values()).filter((ma) => ma.tenantId === tenantId);
  }

  public nextIdentity(): string {
    return `ma-${randomUUID()}`;
  }
}
