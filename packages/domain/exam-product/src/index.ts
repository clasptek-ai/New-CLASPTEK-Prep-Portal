// 1. Aggregates
export * from './aggregates/exam-product.aggregate';
export * from './aggregates/official-exam-structure.aggregate';
export * from './aggregates/assessment-blueprint.aggregate';
export * from './aggregates/skill-framework.aggregate';
export * from './aggregates/learning-framework.aggregate';
export * from './aggregates/readiness-framework.aggregate';
export * from './aggregates/diagnostic-framework.aggregate';

// 2. Value Objects
export * from './value-objects/ExamCode';
export * from './value-objects/ExamProductStatus';
export * from './value-objects/VersionNumber';
export * from './value-objects/BlueprintType';
export * from './value-objects/SkillCode';
export * from './value-objects/SkillLevel';
export * from './value-objects/ReadinessLevel';
export * from './value-objects/ScoreBand';

// 3. Domain & Integration Events
export * from './events/ExamProductCreated';
export * from './events/ExamProductPublished';
export * from './events/ExamProductArchived';
export * from './events/BlueprintPublished';
export * from './events/SkillRevisionCreated';
export * from './events/LearningPathPublished';
export * from './events/ReadinessFrameworkPublished';
export * from './events/IntegrationEvents';

// 4. Specifications
export * from './specifications/CanPublishExamProduct';
export * from './specifications/HasUniqueVersion';
export * from './specifications/BlueprintIsComplete';
export * from './specifications/SkillHierarchyValid';

// 5. Factories
export * from './factories/ExamProductFactory';
export * from './factories/BlueprintFactory';
export * from './factories/SkillFrameworkFactory';

// 6. Repositories
export * from './repositories/exam-product.repository';
export * from './repositories/assessment-blueprint.repository';
export * from './repositories/skill-framework.repository';
export * from './repositories/learning-framework.repository';
export * from './repositories/readiness-framework.repository';
export * from './repositories/diagnostic-framework.repository';

// 7. Domain Services
export * from './services/exam-product-publishing.service';
export * from './services/blueprint-publishing.service';
export * from './services/readiness-calculation.service';

// 8. Errors
export * from './errors/exam-product-errors';
