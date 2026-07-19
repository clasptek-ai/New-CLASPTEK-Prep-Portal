# Package Manifest: @clasptek/domain-curriculum

## Purpose

Declares the Domain Model primitives (Curriculum & Programme Aggregate Roots, CurriculumVersion, ProgrammeVersion, Course, Subject, Module, Competency, LearningObjective, and LearningOutcome Entities, Value Objects, State transitions, Specifications, and Core Events) for curriculum boundaries.

## Metadata

- **Owner**: Technical Architecture & DDD Leads
- **Depends On**: `@clasptek/kernel`
- **Publishes**: Curriculum & Programme Aggregate Roots, nested child Entities, Value Objects, Specs, and Curriculum Lifecycle state machines
- **Consumes**: Kernel Entity and ValueObject base types
- **Business Domain**: Curriculum Bounded Context
- **ADR References**: [ADR-007](../../docs/architecture/ADR/007-curriculum.md)
