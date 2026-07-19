# @clasptek/application-student-learning Package Manifest

## Bounded Context
Student Learning Journey Domain

## Responsibilities
- Implements command handlers for student journey creation/activation, programme enrollment/withdrawal, learning goal registration, study session telemetry logging, bookmark management, achievement unlocks, plan versioning, and privacy consents.
- Implements query handlers for student dashboard projection read models, study session telemetry statistics, milestones timeline, and bookmarks.
- Coordinates database transactions via the repositories and dispatches domain events to observers.
