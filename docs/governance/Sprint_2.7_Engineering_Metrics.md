# Sprint 2.7 — Engineering Metrics

**Sprint:** 2.7 — Assessment Runtime Domain
**Date:** 2026-07-16
**Status:** FINAL

---

## Cumulative Platform Metrics (After Sprint 2.7)

| Metric                   | Count           |
| ------------------------ | --------------- |
| Bounded Contexts         | 9               |
| Aggregate Roots          | 19              |
| Domain Packages          | 8               |
| Application Packages     | 7               |
| Persistence Repositories | 24              |
| Domain Events (total)    | 100             |
| Command Handlers (total) | 66              |
| Query Handlers (total)   | 33              |
| REST Endpoints (total)   | 92              |
| Database Tables (total)  | 83              |
| Migrations (total)       | 22              |
| ADRs (total)             | 12              |
| Test Suites              | 16              |
| Total Tests              | 236             |
| Build Clean              | All packages ✅ |

---

## Sprint 2.7 Delta Metrics

| Metric           | Sprint 2.7 Addition                            |
| ---------------- | ---------------------------------------------- |
| Bounded Contexts | +1 (Assessment Runtime)                        |
| Aggregate Roots  | +2 (`AssessmentInstance`, `AssessmentSession`) |
| Domain Events    | +21                                            |
| Command Handlers | +8                                             |
| Query Handlers   | +5                                             |
| REST Endpoints   | +7                                             |
| Database Tables  | +8                                             |
| Migrations       | +4                                             |
| ADRs             | +1 (ADR-012)                                   |
| Tests            | +15                                            |

---

## Build Performance

| Package                                    | Build Time |
| ------------------------------------------ | ---------- |
| `@clasptek/domain-assessment-runtime`      | ~3s        |
| `@clasptek/application-assessment-runtime` | ~5s        |

---

## Test Performance

| Suite                            | Tests  | Duration  |
| -------------------------------- | ------ | --------- |
| `domain/assessment-runtime`      | 10     | ~24ms     |
| `application/assessment-runtime` | 5      | ~16ms     |
| **Total**                        | **15** | **~2.0s** |
