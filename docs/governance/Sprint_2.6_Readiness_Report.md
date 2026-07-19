# Sprint 2.6 Readiness Report

**Date:** 2026-07-16
**Prepared by:** Clasptek Engineering
**Sprint:** 2.6 — Adaptive Practice Domain
**Status:** Ready for Implementation Review

---

## 1. Dependency Validation

The **Adaptive Practice Domain** will reside in two new workspace packages:
1. `@clasptek/domain-adaptive-practice` (within `packages/domain/adaptive-practice`)
2. `@clasptek/application-adaptive-practice` (within `packages/application/adaptive-practice`)

### Internal Dependencies & References
Both packages will extend `tsconfig.options.json` and declare reference paths.

```mermaid
graph TD
    subgraph Apps
      web[apps/web]
    end
    subgraph Application
      app_ap[@clasptek/application-adaptive-practice]
    end
    subgraph Domain
      dom_ap[@clasptek/domain-adaptive-practice]
      dom_sl[@clasptek/domain-student-learning]
      dom_qb[@clasptek/domain-question-bank]
      dom_curr[@clasptek/domain-curriculum]
    end
    subgraph Kernel & Shared
      kernel[@clasptek/kernel]
      validation[@clasptek/validation]
    end

    web --> app_ap
    app_ap --> dom_ap
    app_ap --> kernel
    dom_ap --> kernel
    dom_ap --> validation
    dom_ap --> dom_sl
    dom_ap --> dom_qb
    dom_ap --> dom_curr
```

- **Dependency Validation Check:** All required upstream domains (`@clasptek/domain-student-learning`, `@clasptek/domain-question-bank`, `@clasptek/domain-curriculum`) are built, unit-tested, and registered in the root `tsconfig.json`.

---

## 2. Existing Reusable Services

We will reuse the following enterprise infrastructure components:
- **`@clasptek/kernel`:** DDD primitives (`Entity`, `AggregateRoot`, `ValueObject`, `Clock`, `SystemClock`, error classes like `NotFoundError`, `ConflictError`, `ValidationError`).
- **`@clasptek/validation`:** Zod format check validation (e.g. `idSchema` for UUID format validation).
- **`@clasptek/persistence`:** `DatabasePool` Postgres pool management and transaction execution wrapper.
- **`@clasptek/observability`:** Structured `Logger` for tracing command/query executions.
- **`@clasptek/configuration`:** `loadEnvironment` for loading environment variables.

---

## 3. Required Integrations

The **Adaptive Practice Domain** will strictly interact with the following contexts:

### Reading from External Contexts
- **Student Learning Journey (`@clasptek/domain-student-learning`)**: Read student's active journey and current competency progress/mastery scores to feed practice recommendations and selection weights.
- **Question Bank (`@clasptek/domain-question-bank`)**: Look up active question versions and metadata (e.g., taxonomy, difficulty) for generating a practice session's question queue.
- **Curriculum (`@clasptek/domain-curriculum`)**: Map practice targets to curriculum competencies, modules, and programmes.
- **Exam Product (`@clasptek/domain-exam-product`)**: Check exam structure for exam-blueprint selection strategies.

### Writing (Strict Boundary)
- The domain **must write only** to its own tables (`practice_sessions`, `practice_session_questions`, `practice_recommendations`, etc.).
- Never mutate student learning journeys, question bank, or curriculum records directly from this bounded context. Communication of results (such as updating student competencies) will happen via publishing domain events (`CompetencyUpdated`, `LessonCompleted`, etc.) or standard handlers in the Student Learning Journey context.

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Adaptive Algorithm Complexity** | High | Start with pluggable selection strategies. The domain defines a clear contract (`QuestionSelectionStrategy`) allowing strategies to be swapped dynamically without altering core business rules. |
| **Concurrency & Race Conditions** | Medium | Implement optimistic locking on practice sessions (`lock_version`). Ensure sessions can only be updated if the version matches. |
| **Question Bank Sync** | Medium | Validate that every question added to a session belongs to a valid, active version in the question bank. |
| **exactOptionalPropertyTypes TS Constraint** | Low | Declare all optional class fields as `T | undefined` (rather than just `?: T`) to ensure compatibility with root tsconfig. |

---

## 5. Implementation Sequence

The sprint will proceed in the following order:

1. **Database Schema:** Write migrations `00600` through `00603` covering practice sessions, recommendations, strategies, feedback, RLS policies, seed definitions, and BRIN indexes.
2. **Domain Package:** Create `@clasptek/domain-adaptive-practice` containing value objects, state machines, events, aggregate roots (`PracticeSession`, `PracticeRecommendation`, `PracticeStrategy`), and unit tests.
3. **Application Package:** Create `@clasptek/application-adaptive-practice` with repository contracts, command/query handlers, selection strategy registry, and test suites.
4. **Persistence Integration:** Write repository implementations in `@clasptek/persistence` and configure imports.
5. **REST API & Context Manager:** Create `adaptive-practice-context.ts` DI container and NextJS route files under `/api/v1/practice/*`.
6. **Verification & Walkthrough:** Verify coverage, dependency-cruiser validation, architecture tests, and compile full build.
7. **Governance:** Create final freeze and release reports.
