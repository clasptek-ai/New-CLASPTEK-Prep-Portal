# Sprint 2.8 Readiness Report

**Date:** 2026-07-16
**Prepared by:** Clasptek Engineering
**Sprint:** 2.8 — AI Evaluation & Scoring Engine Domain
**Status:** READY FOR REVIEW

---

## 1. Scope of Sprint 2.8 (AI Evaluation & Scoring)

Implement the **AI Evaluation & Scoring Engine Domain**, responsible for automated grading of open-ended essays, evaluating programming submissions, validating rubric marks, logging model evaluation audits, and orchestrating asynchronous grading job queues.

Upstream dependencies (Sprint 2.1A, 2.4, 2.6, 2.7) are completed and frozen.

---

## 2. Reusable Foundations from Sprint 2.7

Sprint 2.7 (Assessment Runtime) delivers the primary data feeds ready for Sprint 2.8 evaluation consumption:

| Component            | Description                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `SubmissionRecord`   | The signed cryptographic receipt containing answers checksums, serving as the immutable evaluation source |
| `StudentAnswerSheet` | The complete collection of student responses, revisions, and state logs ready for grading                 |
| `security_incidents` | Runtime security logs providing integrity validation inputs for evaluation status flags                   |

---

## 3. Required Integration Boundaries

- **READ-ONLY:**
  - Read student answers and signatures from **Assessment Runtime (Sprint 2.7)**.
  - Read questions, choices, and evaluation rubrics from **Question Bank (Sprint 2.4)**.
- **WRITE-ONLY:**
  - Save AI grading reports, scores, token counts, and supervisor overrides to the AI Evaluation schema.
  - Emit completion events (`SubmissionGraded`, `EvaluationReportGenerated`) downstream to trigger competency updates in the Student Learning Journey context.

---

## 4. Risks & Mitigations

| Risk                          | Impact | Mitigation                                                                                                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI API latency & timeouts** | High   | Run AI grading asynchronously. Place evaluation requests into a job queue (e.g. pg-boss) and process via background workers with webhook updates. |
| **API Token Cost Spikes**     | Medium | Implement prompt token compression, local regex preprocessing for blank answers, and strict rate-limiting per student.                            |

---

## 5. Go / No-Go Assessment

| Criterion                         | Status |
| --------------------------------- | ------ |
| All Sprint 2.7 tests pass (15/15) | ✅ Go  |
| Workspace builds clean            | ✅ Go  |
| RLS and schema migrations frozen  | ✅ Go  |
| Architecture decisions frozen     | ✅ Go  |

**Assessment: ✅ GO for Sprint 2.8**
