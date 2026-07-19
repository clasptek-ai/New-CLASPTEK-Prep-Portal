# Sprint 2.8 — Release Review
## AI Evaluation & Scoring Domain

**Sprint:** 2.8
**Status:** RELEASED
**Date:** 2026-07-16
**Reviewer:** Engineering Platform Team

---

## Release Summary

Sprint 2.8 delivers the **AI Evaluation & Scoring** bounded context — the engine that evaluates student assessment submissions after they are recorded by the Assessment Runtime (Sprint 2.7).

This sprint is the first implementation of AI-native scoring on the platform.

---

## Deliverables Completed

| Phase | Deliverable | Status |
|---|---|---|
| Database | `00800_ai_evaluation.sql` — 19-table schema | ✅ |
| Database | `00801_ai_evaluation_seed.sql` — Providers, profiles, templates | ✅ |
| Database | `00802_ai_evaluation_rls.sql` — RLS policies | ✅ |
| Database | `00803_ai_evaluation_indexes.sql` — Performance indexes | ✅ |
| Domain | `@clasptek/domain-ai-evaluation` — 5 aggregates, 12 events, 17 VOs, 20 entities | ✅ |
| Application | `@clasptek/application-ai-evaluation` — 5 contracts, 6 commands, 4 queries | ✅ |
| Persistence | 5 Postgres repository implementations | ✅ |
| API | 5 route files, 7 endpoints | ✅ |
| DI | `ai-evaluation-context.ts` | ✅ |
| Tests | 58 tests, 100% pass | ✅ |
| Governance | Architecture Freeze, Repository Contracts, OpenAPI Baseline, Database Manifest, Engineering Metrics, Release Review | ✅ |

---

## Architectural Recommendations Adopted (All 8)

All 8 user recommendations from the pre-implementation review were fully adopted:

1. **EvaluationSnapshot** — Immutable JSONB capture at evaluation time, frozen in domain layer
2. **Prompt Management** — PromptTemplate / PromptVersion / PromptExecution with SHA-256 hashing
3. **Calibration Domain Object** — CalibrationResult with expected/observed score and drift indicator
4. **Frozen Evaluation Profiles** — EvaluationProfile aggregate with 4 moderation policies
5. **Prompt Audit** — Every AI model call recorded with hash, tokens, latency, and status
6. **Human Review Lifecycle** — 6-state machine: ASSIGNED → IN_REVIEW → ESCALATED → APPROVED / REJECTED → PUBLISHED
7. **Evaluation Metrics** — AI latency, token usage, confidence distribution, reviewer override rate
8. **Extended Governance** — AI Provider Registry (seeded), Prompt Catalogue (seeded), Architecture Freeze, Release Review

---

## Open Questions Resolved

| Q | Resolution |
|---|---|
| Q1: Queue schema vs worker | Queue schema in 2.8; worker implementation deferred to 2.9 |
| Q2: MockAIProvider | Included in domain package for CI/test determinism |
| Q3: Reviewer assignment | Manual admin assignment in 2.8; automated routing to 2.9 |

---

## Breaking Changes

None — Sprint 2.8 adds new tables and packages. No existing bounded contexts are modified.

---

## Dependencies for Next Sprint

Sprint 2.9 (Evaluation Worker & Prediction Engine) requires:
- `EvaluationJob` with status `QUEUED` (provided by this sprint)
- `EvaluationSnapshot` immutable contract (frozen in this sprint)
- `EvaluationProfile.requiresHumanReview()` moderation policy (provided by this sprint)
- Prompt catalogue seed data (provided by `00801_ai_evaluation_seed.sql`)
- Real AI provider implementations (to be built in Sprint 2.9)

---

## Sign-Off

| Role | Status |
|---|---|
| Architecture | ✅ Approved — all 8 recommendations adopted |
| Engineering | ✅ Complete — 58/58 tests passing, 0 TypeScript errors |
| Product | ⏳ Pending demo |
| Security | ✅ RLS reviewed and applied |
