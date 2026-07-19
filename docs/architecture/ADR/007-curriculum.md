# ADR-007: Curriculum & Programme Domain Boundaries

## Status

Accepted

## Context

Following the freeze of Sprint 2.1A (Exam Product Domain), Sprint 2.2 introduces the Curriculum Domain. To maintain loose coupling, the Curriculum Domain must reference published Exam Products but should not modify them. We also separate Curriculum and Programme into distinct aggregates to prevent bloating transactional boundaries.

## Decision

1. **Curriculum** and **Programme** are established as separate aggregates.
2. The curriculum catalog ends at the **Module** level (deferring individual Lessons to Sprint 2.3).
3. Many-to-many lookup is used to map specific Curriculum Versions to specific Programme Versions.
4. Value Objects are introduced for validation of versions and codes.

## Consequences

- Improved domain model separation and lower implementation risk.
- Independent mutation boundaries for Programme and Curriculum details.
