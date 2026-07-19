// Root exports for @clasptek/domain-learning-resources

export * from './errors/learning-resource-errors';
export * from './value-objects/learning-resource-value-objects';
export * from './events/learning-resource-events';

// Aggregates
export * from './aggregates/learning-resource.aggregate';
export * from './aggregates/resource-version.aggregate';
export * from './aggregates/resource-collection.aggregate';
export * from './aggregates/storage-asset.aggregate';

// Repositories (Ports)
export * from './repositories/learning-resource.repository';
export * from './repositories/resource-version.repository';
export * from './repositories/resource-collection.repository';
export * from './repositories/storage-asset.repository';
