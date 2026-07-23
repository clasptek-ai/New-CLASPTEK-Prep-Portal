import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';
import {
  ResourceCollectionCreated,
  ResourceCollectionUpdated,
  CollectionResourceAdded,
  CollectionResourceRemoved,
} from '../events/learning-resource-events';

export class ResourceCollection extends AggregateRoot<string> {
  private _resourceIds: string[] = [];

  constructor(
    id: string,
    public parentCollectionId: string | null = null,
    public readonly code: string,
    public name: string,
    public description: string | null = null,
    public displayOrder: number = 1,
    public status: 'draft' | 'active' | 'archived' = 'draft',
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
    if (!code || code.trim() === '') {
      throw new DomainError('Collection code cannot be empty.', 'INVALID_COLLECTION_CODE');
    }
  }

  public get resourceIds(): readonly string[] {
    return this._resourceIds;
  }

  public static create(
    id: string,
    parentCollectionId: string | null,
    code: string,
    name: string,
    description?: string,
    displayOrder?: number
  ): ResourceCollection {
    const col = new ResourceCollection(
      id,
      parentCollectionId,
      code,
      name,
      description || null,
      displayOrder || 1,
      'draft'
    );
    col.addDomainEvent(new ResourceCollectionCreated(id, code));
    return col;
  }

  public update(name: string, description: string | null, parentCollectionId: string | null) {
    if (this.status === 'archived') {
      throw new DomainError('Cannot update an archived collection.', 'COLLECTION_ARCHIVED');
    }
    this.name = name;
    this.description = description;
    this.parentCollectionId = parentCollectionId;
    this.updatedAt = new Date();
    this.addDomainEvent(new ResourceCollectionUpdated(this.id, name));
  }

  public addResource(resourceId: string) {
    if (this.status === 'archived') {
      throw new DomainError(
        'Cannot modify resources in an archived collection.',
        'COLLECTION_ARCHIVED'
      );
    }
    if (this._resourceIds.includes(resourceId)) {
      return;
    }
    this._resourceIds.push(resourceId);
    this.updatedAt = new Date();
    this.addDomainEvent(new CollectionResourceAdded(this.id, resourceId));
  }

  public removeResource(resourceId: string) {
    if (this.status === 'archived') {
      throw new DomainError(
        'Cannot modify resources in an archived collection.',
        'COLLECTION_ARCHIVED'
      );
    }
    const idx = this._resourceIds.indexOf(resourceId);
    if (idx !== -1) {
      this._resourceIds.splice(idx, 1);
      this.updatedAt = new Date();
      this.addDomainEvent(new CollectionResourceRemoved(this.id, resourceId));
    }
  }

  public reorderResources(orderedResourceIds: string[]) {
    if (this.status === 'archived') {
      throw new DomainError(
        'Cannot reorder resources in an archived collection.',
        'COLLECTION_ARCHIVED'
      );
    }
    // Verify set matches
    const currentSet = new Set(this._resourceIds);
    const newSet = new Set(orderedResourceIds);
    if (currentSet.size !== newSet.size || !orderedResourceIds.every((id) => currentSet.has(id))) {
      throw new DomainError(
        'Reordered resource list must contain exactly the same set of resource IDs.',
        'INVALID_REORDER_LIST'
      );
    }
    this._resourceIds = [...orderedResourceIds];
    this.updatedAt = new Date();
  }

  public archive() {
    this.status = 'archived';
    this.updatedAt = new Date();
  }

  public setResourceIds(resourceIds: string[]) {
    this._resourceIds = resourceIds;
  }
}
