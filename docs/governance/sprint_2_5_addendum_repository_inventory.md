# Sprint 2.5 Addendum Repository Inventory

| Repository Interface               | Concrete Postgres Implementation           | Package Location        | Key Capabilities                                            |
| ---------------------------------- | ------------------------------------------ | ----------------------- | ----------------------------------------------------------- |
| `StudentLearningRepository`        | `PostgresStudentLearningRepository`        | `@clasptek/persistence` | Journey CRUD, Goal, Milestone, Session management           |
| `ProgrammeEnrollmentRepository`    | `PostgresProgrammeEnrollmentRepository`    | `@clasptek/persistence` | Enrollment management, target exam date & score persistence |
| `LearningPlanRepository`           | `PostgresLearningPlanRepository`           | `@clasptek/persistence` | Study plan versioning and schedule persistence              |
| `DashboardProjectionRepository`    | `PostgresDashboardProjectionRepository`    | `@clasptek/persistence` | CQRS Projection repository for Student Dashboard            |
| `StudentLearningProfileRepository` | `PostgresStudentLearningProfileRepository` | `@clasptek/persistence` | Learning pace & study hour preferences                      |
| `ReadinessRepository`              | `PostgresReadinessRepository`              | `@clasptek/persistence` | Exam readiness scores & trend tracking                      |
| `InterventionRepository`           | `PostgresInterventionRepository`           | `@clasptek/persistence` | Academic risk interventions & alert history                 |
