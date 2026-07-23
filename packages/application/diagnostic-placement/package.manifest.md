# Package Manifest: @clasptek/application-diagnostic-placement

## Package Identity

| Field        | Value                                        |
| ------------ | -------------------------------------------- |
| Package Name | `@clasptek/application-diagnostic-placement` |
| Sprint       | 2.4                                          |
| Layer        | Application                                  |
| Status       | ACTIVE                                       |
| Last Updated | 2026-07-20                                   |

## Purpose

Application layer for the **Diagnostic & Placement** bounded context.

Implements command and query handlers that orchestrate the diagnostic assessment lifecycle:
creating diagnostics, managing student attempts, calculating placement results, and
generating skill profiles and learning path recommendations.

## Bounded Context

| Item             | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Bounded Context  | Diagnostic & Placement                                                                                |
| Command Handlers | `CreateDiagnosticHandler`, `StartAttemptHandler`, `SubmitAttemptHandler`, `CalculatePlacementHandler` |
| Query Handlers   | `GetDiagnosticHandler`, `GetPlacementResultHandler`, `GetSkillProfileHandler`                         |
| Port Contracts   | `DiagnosticRepository`, `AttemptRepository`, `PlacementResultRepository`                              |

## Architectural Rules

- **May import** `@clasptek/domain-diagnostic-placement` for aggregate types
- **No React imports** — application layer is framework-agnostic
- **No Supabase SDK** — infrastructure concern only
- **No direct pg driver** — use repository contracts
- **No Next.js imports** — server framework is in the API layer
- **No `@clasptek/persistence`** — persistence is infrastructure

## Dependencies

| Package                                 | Type     | Reason                            |
| --------------------------------------- | -------- | --------------------------------- |
| `@clasptek/domain-diagnostic-placement` | Internal | Aggregate types and domain events |
| `@clasptek/kernel`                      | Internal | Base command/query handler types  |

## ADR Reference

Registered under [ADR-003](../../../docs/architecture/ADR/003-ddd.md) DDD boundaries.
