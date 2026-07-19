# Sprint 2.5 — Engineering Metrics

**Sprint:** 2.5 — Student Learning Journey Domain
**Date:** 2026-07-16
**Status:** FINAL

---

## Cumulative Platform Metrics (After Sprint 2.5)

| Metric | Count |
|---|---|
| Bounded Contexts | 7 |
| Aggregate Roots | 13 |
| Domain Packages | 6 |
| Application Packages | 5 |
| Persistence Repositories | 16 |
| Domain Events (total) | 62 |
| Command Handlers (total) | 48 |
| Query Handlers (total) | 22 |
| REST Endpoints (total) | 74 |
| Database Tables (total) | 65 |
| Migrations (total) | 14 |
| ADRs (total) | 10 |
| Test Suites | 12 |
| Total Tests | 198 |
| Coverage | ~94% (domain layer) |
| Build Clean | ✅ All packages |

---

## Sprint 2.5 Delta Metrics

| Metric | Sprint 2.5 Addition |
|---|---|
| Bounded Contexts | +1 (Student Learning Journey) |
| Aggregate Roots | +3 |
| Domain Events | +20 |
| Command Handlers | +11 |
| Query Handlers | +5 |
| REST Endpoints | +20 |
| Database Tables | +17 |
| Migrations | +4 |
| ADRs | +1 (ADR-010) |
| Test Suites | +2 |
| Tests | +42 |

---

## Package Sizes (Sprint 2.5 Additions)

| Package | Lines of Code |
|---|---|
| `@clasptek/domain-student-learning/src/index.ts` | ~1,181 |
| `@clasptek/application-student-learning/src/index.ts` | ~476 |
| `packages/persistence/src/index.ts` (additions) | ~598 |
| Web API routes (15 route files) | ~400 |
| Database migrations (4 files) | ~800 |

---

## Build Performance

| Package | Build Time |
|---|---|
| `@clasptek/domain-student-learning` | ~5s |
| `@clasptek/application-student-learning` | ~12s |

---

## Test Performance

| Suite | Tests | Duration |
|---|---|---|
| `domain/student-learning` | 34 | ~44ms |
| `application/student-learning` | 8 | ~92ms (mock-based) |
| **Total Sprint 2.5** | **42** | **~1.5s** |

---

## TypeScript Strictness

All packages compiled with:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitReturns: true`
- Zero suppression directives (`@ts-ignore` / `@ts-expect-error`)

---

## Sprint Velocity

| Sprint | Test Count | Tables | ADRs |
|---|---|---|---|
| Phase 1 | 52 | 18 | 6 |
| Sprint 2.1A | 28 | 12 | 1 |
| Sprint 2.2 | 34 | 14 | 1 |
| Sprint 2.3 | 18 | 10 | 1 |
| Sprint 2.4 | 24 | 12 | 1 |
| **Sprint 2.5** | **42** | **17** | **1** |
| **Total** | **198** | **83** | **11** |
