# Sprint 2.7 Readiness Report

**Date:** 2026-07-16
**Prepared by:** Clasptek Engineering
**Sprint:** 2.7 — Assessment Runtime Domain
**Status:** READY FOR REVIEW

---

## 1. Scope of Sprint 2.7 (Assessment Runtime)

Implement the **Assessment Runtime Domain**, responsible for running assessments and capturing student response attempts, answers scoring, and timing metrics.

Upstream dependencies (Sprint 2.1A, 2.4, 2.6) are completed and frozen.

---

## 2. Reusable Foundations from Sprint 2.6

Sprint 2.6 (Adaptive Practice) delivers several core interfaces ready for Sprint 2.7 consumption:

| Component | Description |
|---|---|
| `PracticeSession` | The generated question queue (session ID, version, order, skipped/accuracy status) that serves as the blueprint input for the runtime |
| `PostgresPracticeSessionRepository` | Repository for saving results (accuracies, duration, time spent) after runtime execution |
| `AttemptLog` | The interface structure used by the eligibility engine to calculate spaced retrieval cooling-off limits |

---

## 3. Required Integration Boundaries

- **READ-ONLY:**
  - Read questions and answer options from **Question Bank (Sprint 2.4)**.
  - Read generated session queues and plans from **Adaptive Practice (Sprint 2.6)**.
- **WRITE-ONLY:**
  - Save student assessment attempt telemetry, response inputs, and marks to the Assessment Runtime schema.
  - Communicate completion events downstream (`AssessmentCompleted`, `AttemptSubmitted`) to trigger student progress updates in Student Learning context.

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **High concurrency during live exams** | High | Use session-scoped partitions. Assessment runtimes must operate statelessly per user session, saving checkpoints continuously. |
| **Network connectivity drops** | Medium | Implement local storage syncing. Telemetry is batched on the client and pushed periodically, allowing offline recovery. |

---

## 5. Go / No-Go Assessment

| Criterion | Status |
|---|---|
| All Sprint 2.6 tests pass (23/23) | ✅ Go |
| Workspace builds clean | ✅ Go |
| RLS and schema migrations frozen | ✅ Go |
| Architecture frozen | ✅ Go |

**Assessment: ✅ GO for Sprint 2.7**
