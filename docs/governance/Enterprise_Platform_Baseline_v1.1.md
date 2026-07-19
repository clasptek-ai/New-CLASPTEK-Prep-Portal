# Enterprise Platform Baseline v1.1

**Version:** 1.1  
**Status:** BASELINE FROZEN

## Executive Summary

This document updates the Enterprise Platform Baseline following completion of Sprint 2.6 (Adaptive Practice Domain). It freezes the enterprise architecture before Sprint 2.7 (Assessment Runtime).

## Architecture Status

- Core Platform ✅
- Identity & Security ✅
- Academic Authoring ✅
- Student Learning ✅
- Adaptive Practice ✅
- Assessment Runtime ⏳
- AI Evaluation ⏳
- Prediction Engine ⏳
- AI Learning Coach ⏳

## Added in v1.1

- Adaptive Practice Domain
- ADR-011 (Adaptive Practice Domain)
- Repository Contracts
- REST API Inventory
- Runtime Event Catalogue
- Updated Performance Metrics
- New Governance Documents

## Runtime Dependency Diagram

```text
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

### Dependency Rules

- Student Learning Journey owns learner state.
- Adaptive Practice owns recommendations and practice orchestration.
- Assessment Runtime owns execution.
- AI Evaluation owns scoring.
- Prediction Engine owns forecasting.
- AI Learning Coach owns interventions.

## Repository Contracts (Frozen)

### PracticeSessionRepository
- save()
- findById()
- findActive()
- search()
- archive()
- restore()
- nextIdentity()

### PracticePlanRepository
- save()
- findById()
- publish()
- search()

### RecommendationRepository
- save()
- findPending()
- accept()
- reject()
- expire()

### StrategyRepository
- save()
- findByCode()
- findAll()

## REST APIs

- GET /api/v1/practice
- GET /api/v1/practice/{id}
- GET /api/v1/practice/recommendations
- GET /api/v1/practice/history
- POST /api/v1/practice/generate
- POST /api/v1/practice/start
- POST /api/v1/practice/pause
- POST /api/v1/practice/resume
- POST /api/v1/practice/complete
- POST /api/v1/practice/recommendations/{id}/accept
- POST /api/v1/practice/recommendations/{id}/reject

## Runtime Event Catalogue

Adaptive Practice publishes:

- PracticeSessionCreated
- PracticeGenerated
- PracticeStarted
- PracticePaused
- PracticeCompleted
- PracticeArchived
- RecommendationGenerated
- RecommendationAccepted
- RecommendationRejected
- AdaptiveSnapshotUpdated
- DifficultyAdjusted
- CompetencyTargetReached

Assessment Runtime consumes these events and must not mutate Adaptive Practice state.

## Performance Baselines

| Operation | Target | Current |
|---|---:|---:|
| Practice Session Generation | <500 ms | ~120 ms |
| Recommendation Engine | <300 ms | ~45 ms |
| Session Retrieval | <200 ms | ~80 ms |
| Eligibility Filter | <150 ms | ~10 ms |

## Governance Documents

- Sprint_2.6_Release_Review.md
- Sprint_2.6_Architecture_Freeze.md
- Sprint_2.6_Engineering_Metrics.md
- Sprint_2.6_OpenAPI_Baseline.md
- Sprint_2.6_Database_Manifest.md
- Sprint_2.6_Repository_Contracts.md
- Sprint_2.6_Performance_Baseline.md
- Sprint_2.6_Technical_Debt_Register.md
- Sprint_2.7_Readiness_Report.md

## Execution Readiness Checklist

- [x] Repository contracts frozen
- [x] API contracts frozen
- [x] Domain events frozen
- [x] Performance baseline recorded
- [x] Architecture dependencies validated

## Baseline Declaration

Enterprise Platform Baseline v1.1 is the authoritative architectural reference after Sprint 2.6. Future architectural changes require a new ADR, governance updates, and a baseline version increment.
