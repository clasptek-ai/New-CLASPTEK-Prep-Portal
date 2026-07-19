# Enterprise Platform Baseline v1.2

**Version:** 1.2  
**Status:** Architecture Baseline Frozen  
**Baseline Date:** After Sprint 2.7 – Assessment Runtime Domain

---

# Executive Summary

Enterprise Platform Baseline v1.2 establishes the official architectural reference after successful completion of Sprint 2.7 (Assessment Runtime). This baseline freezes the execution layer, repository contracts, runtime events, performance expectations, governance artifacts, and cross-domain dependencies before Sprint 2.8 (AI Evaluation).

---

# Architecture Status

| Layer | Status |
|---|---|
| Core Platform | ✅ Complete |
| Identity & Security | ✅ Complete |
| Academic Authoring | ✅ Complete |
| Student Learning Journey | ✅ Complete |
| Adaptive Practice | ✅ Complete |
| Assessment Runtime | ✅ Complete |
| AI Evaluation | ⏳ Next Sprint |
| Prediction Engine | ⏳ Planned |
| AI Learning Coach | ⏳ Planned |

---

# New in Version 1.2

- Assessment Runtime Domain
- ADR-012 — Assessment Runtime
- Runtime Repository Contracts
- Runtime REST APIs
- Runtime Event Catalogue
- Runtime Performance Baseline
- Sprint 2.7 Governance Package

---

# Execution Layer Diagram

```text
Adaptive Practice
        │
        ▼
Assessment Instance
        │
        ▼
Assessment Runtime
        │
        ▼
Submission
        │
        ▼
AI Evaluation
```

---

# Runtime Repository Contracts (Frozen)

## AssessmentSessionRepository

- save()
- findById()
- findActive()
- archive()
- restore()
- search()

## AnswerSheetRepository

- save()
- saveAnswer()
- find()
- submit()

## CheckpointRepository

- save()
- restore()
- deleteExpired()

## RuntimeStatisticsRepository

- update()
- find()
- aggregate()

---

# Runtime API Inventory

- GET /api/v1/runtime/{id}
- POST /api/v1/runtime/start
- POST /api/v1/runtime/pause
- POST /api/v1/runtime/resume
- POST /api/v1/runtime/save-answer
- POST /api/v1/runtime/checkpoint
- POST /api/v1/runtime/submit
- GET /api/v1/runtime/statistics
- GET /api/v1/runtime/history

---

# Runtime Event Catalogue

- AssessmentSessionCreated
- AssessmentStarted
- AssessmentPaused
- AssessmentResumed
- AnswerSaved
- AnswerUpdated
- QuestionVisited
- CheckpointCreated
- RuntimeHeartbeatRecorded
- RuntimeHeartbeatMissed
- SecurityIncidentDetected
- SubmissionStarted
- AssessmentSubmitted
- SubmissionCompleted
- SubmissionFailed
- RuntimeArchived

Consumers:

- AI Evaluation
- Student Learning Journey
- Prediction Engine
- Enterprise Analytics

---

# Runtime Performance Baseline

| Operation | Target | Actual |
|---|---:|---:|
| Session Creation | <150 ms | Record during production rollout |
| Save Answer | <50 ms | Record during production rollout |
| Checkpoint | <100 ms | Record during production rollout |
| Resume | <250 ms | Record during production rollout |
| Submission | <500 ms | Record during production rollout |

---

# Runtime Dependency Matrix

| Domain | Reads | Writes |
|---|---|---|
| Assessment Runtime | Adaptive Practice, Question Bank, Student Learning Journey | Assessment Runtime |
| AI Evaluation | Assessment Runtime, Question Bank | AI Evaluation |
| Prediction Engine | AI Evaluation, Student Learning Journey | Prediction Engine |

---

# Sprint 2.7 Governance Deliverables

- Sprint_2.7_Release_Review.md
- Sprint_2.7_Architecture_Freeze.md
- Sprint_2.7_Engineering_Metrics.md
- Sprint_2.7_OpenAPI_Baseline.md
- Sprint_2.7_Database_Manifest.md
- Sprint_2.7_Repository_Contracts.md
- Sprint_2.7_Performance_Baseline.md
- Sprint_2.7_Technical_Debt_Register.md
- Sprint_2.8_Readiness_Report.md

---

# Enterprise Architecture Position

```text
Identity & Security
        │
        ▼
Academic Authoring
        │
        ▼
Student Learning Journey
        │
        ▼
Adaptive Practice
        │
        ▼
Assessment Runtime
        │
        ▼
AI Evaluation
        │
        ▼
Prediction Engine
        │
        ▼
AI Learning Coach
```

---

# Responsibility Matrix

| Domain | Responsibility |
|---|---|
| Question Bank | Assessment content |
| Student Learning Journey | Learner state |
| Adaptive Practice | Personalized planning |
| Assessment Runtime | Assessment execution |
| AI Evaluation | Scoring & feedback |
| Prediction Engine | Readiness forecasting |
| AI Learning Coach | Personalized guidance |

---

# Final Verdict

Sprint 2.7 is approved and frozen.

Enterprise Platform Baseline v1.2 becomes the authoritative architectural reference until superseded by a later baseline.
