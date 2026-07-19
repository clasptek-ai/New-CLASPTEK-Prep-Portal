import { ResourceVersion } from '../aggregates/resource-version.aggregate';

export interface ResourceVersionRepository {
  save(version: ResourceVersion): Promise<void>;
  findById(id: string): Promise<ResourceVersion | null>;
  findByVariantAndNo(variantId: string, versionNo: number): Promise<ResourceVersion | null>;
  nextIdentity(): string;
}
