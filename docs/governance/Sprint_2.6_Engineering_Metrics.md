# Sprint 2.6 — Engineering Metrics

**Sprint:** 2.6 — Adaptive Practice Domain
**Date:** 2026-07-16
**Status:** FINAL

---

## Cumulative Platform Metrics (After Sprint 2.6)

| Metric | Count |
|---|---|
| Bounded Contexts | 8 |
| Aggregate Roots | 17 |
| Domain Packages | 7 |
| Application Packages | 6 |
| Persistence Repositories | 20 |
| Domain Events (total) | 79 |
| Command Handlers (total) | 58 |
| Query Handlers (total) | 28 |
| REST Endpoints (total) | 85 |
| Database Tables (total) | 75 |
| Migrations (total) | 18 |
| ADRs (total) | 11 |
| Test Suites | 14 |
| Total Tests | 221 |
| Build Clean | All packages ✅ |

---

## Sprint 2.6 Delta Metrics

| Metric | Sprint 2.6 Addition |
|---|---|
| Bounded Contexts | +1 (Adaptive Practice) |
| Aggregate Roots | +4 |
| Domain Events | +17 |
| Command Handlers | +10 |
| Query Handlers | +6 |
| REST Endpoints | +11 |
| Database Tables | +10 |
| Migrations | +4 |
| ADRs | +1 (ADR-011) |
| Tests | +23 |

---

## Build Performance

| Package | Build Time |
|---|---|
| `@clasptek/domain-adaptive-practice` | ~4s |
| `@clasptek/application-adaptive-practice` | ~8s |

---

## Test Performance

| Suite | Tests | Duration |
|---|---|---|
| `domain/adaptive-practice` | 16 | ~25ms |
| `application/adaptive-practice` | 7 | ~21ms |
| **Total** | **23** | **~1.4s** |
