# ADR 025: Command Query Responsibility Segregation (CQRS) and Read Models

## Context

High concurrent traffic reads the exam configurations, while administrative updates are occasional. Mixing read and write structures on the same aggregates degrades performance and introduces state validation vulnerabilities.

## Decision

We segregate operations:

- **Commands:** Mutate state through aggregates (e.g. `CreateExamProduct`, `PublishExamProduct`).
- **Queries:** Return projection read models (`ExamProductReadModel`, `SkillHierarchyReadModel`, `BlueprintReadModel`) directly querying database views.

## Consequences

- Clean separation of concerns.
- Optimizes query response times.
- Thick command pipeline and extremely light read pipeline.
