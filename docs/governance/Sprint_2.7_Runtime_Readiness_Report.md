# Sprint 2.7 Readiness Report — Assessment Runtime Domain

**Date:** 2026-07-16
**Prepared by:** Clasptek Engineering
**Sprint:** 2.7 — Assessment Runtime Domain
**Status:** Ready for Implementation Review

---

## 1. Dependency Validation

The **Assessment Runtime Domain** will reside in two new workspace packages:
1. `@clasptek/domain-assessment-runtime` (within `packages/domain/assessment-runtime`)
2. `@clasptek/application-assessment-runtime` (within `packages/application/assessment-runtime`)

### Bounded Context Boundaries & References

Under the architectural guidelines, the Assessment Runtime context operates downstream of Adaptive Practice, Question Bank, and Curriculum. It has read-only access to those contexts but writes exclusively to its own database schema.

```mermaid
graph TD
    subgraph Apps
      web[apps/web]
    end
    subgraph Application
      app_rt[@clasptek/application-assessment-runtime]
    end
    subgraph Domain
      dom_rt[@clasptek/domain-assessment-runtime]
      dom_ap[@clasptek/domain-adaptive-practice]
      dom_qb[@clasptek/domain-question-bank]
      dom_sl[@clasptek/domain-student-learning]
      dom_curr[@clasptek/domain-curriculum]
      dom_ep[@clasptek/domain-exam-product]
    end
    subgraph Kernel & Shared
      kernel[@clasptek/kernel]
      validation[@clasptek/validation]
    end

    web --> app_rt
    app_rt --> dom_rt
    app_rt --> kernel
    dom_rt --> kernel
    dom_rt --> validation
    dom_rt --> dom_ap
    dom_rt --> dom_qb
    dom_rt --> dom_sl
    dom_rt --> dom_curr
    dom_rt --> dom_ep
```

- **Dependency Validation Check:** All required upstream domains (`@clasptek/domain-adaptive-practice`, `@clasptek/domain-question-bank`, `@clasptek/domain-student-learning`, `@clasptek/domain-curriculum`, `@clasptek/domain-exam-product`) are fully registered, compile clean, and have passing unit tests.

---

## 2. Event Contracts

The Assessment Runtime consumes state events from Adaptive Practice and curriculum boundaries, and publishes domain lifecycle events for downstream consumption by AI Evaluation, Analytics, and Learner Journey.

### Consumed Upstream Events
- `PracticeSessionCreated` / `PracticeStarted` (Adaptive Practice)
- `CurriculumPublished` (Curriculum)

### Published Runtime Events
- `AssessmentSessionCreated`
- `AssessmentStarted`
- `AssessmentPaused`
- `AssessmentResumed`
- `AssessmentDisconnected`
- `CheckpointCreated`
- `AnswerSaved`
- `AnswerUpdated`
- `QuestionVisited`
- `TimeWarningIssued`
- `SubmissionStarted`
- `AssessmentSubmitted`
- `SubmissionCompleted`
- `SubmissionFailed`
- `RuntimeArchived`

---

## 3. Security Assumptions & Safeguards

The runtime domain will enforce strict verification policies directly in the domain logic and repository boundaries:
- **Session Ownership Validation:** Authenticated student context must match `studentId` on the session aggregate.
- **Row-Level Security (RLS):** database rules restrict access to `student_id = auth.uid()`.
- **Anti-Duplicate Submission:** Once the aggregate state machine transitions to `SUBMITTED`, all subsequent submission triggers are rejected by returning immediate conflict checks.
- **Timer Tampering Detection:** Checks that the reported elapsed time does not exceed physical clock increments and that the session timer never moves backwards.
- **Resume Token Validation:** Resuming a disconnected session requires a cryptographically validated, non-expired `ResumeToken`.
- **Audit Logging:** Every transition and configuration mutation is logged with metadata (device hash, fingerprint, connectivity snapshot).

---

## 4. Performance Targets

Latency budgets are defined as follows:

| Operation | Target Latency | Baseline Strategy |
|---|---|---|
| **Session Creation** | `< 150 ms` | Fast blueprint replication and single transaction database insert. |
| **Save Answer** | `< 75 ms` | Partial update of student answers table, leveraging index lookups. |
| **Autosave** | `< 100 ms` | Non-blocking background delta saves of answer changes. |
| **Resume Session** | `< 250 ms` | Direct checkpoint retrieval and token authentication checks. |
| **Submit Session** | `< 500 ms` | Transactional transition to SUBMITTED state, saving answer sheet. |
| **Checkpoint Create** | `< 100 ms` | Low-latency state serialization to `runtime_checkpoints` table. |

---

## 5. Go / No-Go Checklist

- [x] Upstream package builds compile clean: **Go**
- [x] All 161 workspace unit/integration tests pass: **Go**
- [x] OpenAPI endpoint routes match Sprint 2.7 specifications: **Go**
- [x] Repository interfaces conform to DDD pattern: **Go**

**Assessment: ✅ GO for Sprint 2.7 Implementation**
