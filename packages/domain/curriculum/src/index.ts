// Index export for Curriculum Bounded Context Domain layer

// Errors
export * from './errors/curriculum-errors';

// Value Objects
export * from './value-objects/curriculum-id.vo';
export * from './value-objects/curriculum-version-id.vo';
export * from './value-objects/module-id.vo';
export * from './value-objects/lesson-id.vo';
export * from './value-objects/activity-id.vo';
export * from './value-objects/assignment-id.vo';
export * from './value-objects/outcome-id.vo';
export * from './value-objects/curriculum-code.vo';
export * from './value-objects/curriculum-status.vo';
export * from './value-objects/estimated-study-time.vo';
export * from './value-objects/mastery-percentage.vo';
export * from './value-objects/sequence-number.vo';
export * from './value-objects/learning-sequence.vo';
export * from './value-objects/dependency-version.vo';

// Entities
export * from './entities/dependency-lock.entity';
export * from './entities/curriculum-locale.entity';
export * from './entities/translation.entity';
export * from './entities/learning-outcome.entity';
export * from './entities/learning-activity.entity';
export * from './entities/learning-assignment.entity';
export * from './entities/resource-reference.entity';
export * from './entities/module-prerequisite.entity';
export * from './entities/lesson-prerequisite.entity';
export * from './entities/curriculum-template-version.entity';

// Aggregates
export * from './aggregates/curriculum.aggregate';
export * from './aggregates/curriculum-version.aggregate';
export * from './aggregates/learning-module.aggregate';
export * from './aggregates/lesson.aggregate';
export * from './aggregates/curriculum-template.aggregate';

// Specifications
export * from './specifications/no-circular-module-dependencies.specification';
export * from './specifications/no-circular-lesson-dependencies.specification';
export * from './specifications/module-sequence.specification';
export * from './specifications/lesson-sequence.specification';
export * from './specifications/outcome-coverage.specification';
export * from './specifications/learning-path-coverage.specification';
export * from './specifications/blueprint-alignment.specification';
export * from './specifications/resource-availability.specification';
export * from './specifications/curriculum-completeness.specification';
export * from './specifications/curriculum-publishing.specification';

// Repositories (Ports)
export * from './repositories/curriculum.repository';
export * from './repositories/curriculum-version.repository';
export * from './repositories/learning-module.repository';
export * from './repositories/lesson.repository';
export * from './repositories/curriculum-template.repository';

// Events
export * from './events/curriculum-created.event';
export * from './events/curriculum-version-draft-created.event';
export * from './events/curriculum-version-published.event';
export * from './events/curriculum-dependency-locked.event';
export * from './events/module-added.event';
export * from './events/lesson-added.event';
export * from './events/learning-outcome-added.event';
