# Repository Architecture and Design Standards

This document establishes coding rules, dependency matrices, and compile pipelines for Clasptek Prep Portal V2.

---

## 1. Repository Principles

To keep the codebase maintainable and prevent logic leakage across boundaries, all developers must adhere to these repository constraints:

1. **Repositories never contain business logic**: Repositories only load and save aggregate states. Calculation, routing, and decision workflows belong in the Domain Model or Application services.
2. **Repositories never call external APIs**: Repositories interact only with the datastore (SQL database, blob storage). External APIs must be resolved via application-level integrations/ports.
3. **Repositories never publish events**: Domain events are gathered on aggregate roots and dispatched from application use-cases, ensuring database transactions commit before events are broadcast.
4. **Repositories only persist aggregates**: Fine-grained entities within aggregate boundaries cannot be retrieved or written directly; all writes must route through the Aggregate Root.

---

## 2. Dependency Direction Rules

We enforce a strict dependency hierarchy based on Clean Architecture boundaries. All imports must move inward:

```text
Infrastructure (persistence, integrations, configuration)
        ↓
Domain & Application Services
        ↓
Domain Core (entities, values objects, kernels)
```

- **Domain Core & Kernels**: Have zero external dependencies. They contain pure business entities, value objects, domain rules, and interfaces.
- **Application Services**: Orchestrate business use cases, invoking domain models and persistence ports. They cannot import infrastructure implementations directly (e.g. they use `PersistencePort` interface rather than Postgres client classes).
- **Infrastructure**: Implement ports (database clients, adapters, file storage, email providers). Infrastructure _never_ owns business logic.

_Dependency direction must never be reversed._

---

## 3. Forbidden Dependency Matrix

The following matrix enforces code import boundaries. A "Yes" indicates imports are permitted, and "No" indicates imports will be blocked in CI tests:

| Target Package (Inward) | apps/web | apps/worker | persistence | authorization | configuration | observability | events | validation | kernel |
| ----------------------- | -------- | ----------- | ----------- | ------------- | ------------- | ------------- | ------ | ---------- | ------ |
| **apps/web**            | —        | No          | No          | Yes           | No            | Yes           | Yes    | Yes        | Yes    |
| **apps/worker**         | No       | —           | Yes         | Yes           | Yes           | Yes           | Yes    | Yes        | Yes    |
| **persistence**         | No       | No          | —           | Yes           | Yes           | Yes           | Yes    | Yes        | Yes    |
| **authorization**       | No       | No          | No          | —             | Yes           | Yes           | Yes    | Yes        | Yes    |
| **configuration**       | No       | No          | No          | No            | —             | Yes           | No     | Yes        | Yes    |
| **events**              | No       | No          | No          | No            | No            | Yes           | —      | Yes        | Yes    |
| **validation**          | No       | No          | No          | No            | No            | Yes           | No     | —          | Yes    |
| **kernel**              | No       | No          | No          | No            | No            | No            | No     | No         | —      |

_Additional Domain constraints:_

- `packages/domain/question-bank` **cannot import** from `packages/domain/assessment`, `packages/domain/simulation`, or `packages/domain/ai`.
- `packages/domain/ai` **cannot import** from `packages/domain/question-bank`, `packages/domain/identity`, or `packages/persistence` directly.

---

## 4. Build Compilation Graph

Turborepo parses workspace definitions and executes builds in this exact sequence to ensure strict contract consistency:

```text
       [packages/kernel] & [packages/shared]
                 ↓
       [packages/validation]
                 ↓
       [packages/events]
                 ↓
       [packages/contracts]
                 ↓
      [packages/authorization]
                 ↓
     [packages/observability] & [packages/configuration]
                 ↓
     [packages/persistence] & [packages/ui]
                 ↓
       [apps/web] & [apps/worker]
```
