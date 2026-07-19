import { ResourceCollection } from '../aggregates/resource-collection.aggregate';

export interface ResourceCollectionRepository {
  save(collection: ResourceCollection): Promise<void>;
  findById(id: string): Promise<ResourceCollection | null>;
  findByCode(code: string): Promise<ResourceCollection | null>;
  nextIdentity(): string;
}
