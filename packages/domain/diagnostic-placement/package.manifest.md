# Package Manifest: @clasptek/domain-diagnostic-placement

## Package Identity

| Field        | Value                                   |
| ------------ | --------------------------------------- |
| Package Name | `@clasptek/domain-diagnostic-placement` |
| Sprint       | 2.4                                     |
| Layer        | Domain                                  |
| Status       | ACTIVE                                  |
| Last Updated | 2026-07-20                              |

## Purpose

Domain layer for the **Diagnostic & Placement** bounded context.

Implements the entry diagnostic engine that assesses a new student's current ability
level and generates a personalised placement recommendation for their exam preparation pathway.

## Bounded Context

| Item                 | Value                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Bounded Context      | Diagnostic & Placement                                                                                    |
| Aggregate Root(s)    | `Diagnostic`, `Attempt`, `PlacementResult`                                                                |
| Domain Events        | `DiagnosticCreated`, `AttemptStarted`, `AttemptSubmitted`, `PlacementCalculated`, `SkillProfileGenerated` |
| Repository Contracts | `DiagnosticRepository`, `AttemptRepository`, `PlacementResultRepository`                                  |

## Architectural Rules

- **No React imports** — domain layer is framework-agnostic
- **No Supabase SDK** — infrastructure concern only
- **No direct pg driver** — use repository contracts
- **No Next.js imports** — server framework is in the API layer
- **No `@clasptek/persistence`** — persistence is infrastructure

## Dependencies

| Package            | Type     | Reason                 |
| ------------------ | -------- | ---------------------- |
| `@clasptek/kernel` | Internal | Base domain primitives |

## ADR Reference

Registered under [ADR-003](../../../docs/architecture/ADR/003-ddd.md) DDD boundaries.
