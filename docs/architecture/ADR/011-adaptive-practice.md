# ADR-011 — Adaptive Practice Domain

**Status:** Accepted | **Implementation:** Complete | **Frozen:** Yes

**Date:** 2026-07-16

**Sprint:** 2.6

**Author:** Clasptek Engineering

---

## Context

Sprint 2.6 introduces the **Adaptive Practice Domain** to model the intelligent selection and delivery of practice questions to students. The design decisions here must balance complex recommendation requirements (spaced repetition, selection algorithms, and snapshot cache) with clear boundary boundaries (never mutating Question Bank or Student Learning Journey transactional models).

---

## Decision

### 1. Three Core Aggregates
We separate generation, scheduling, and execution into three separate aggregates (Rec 1):
- `PracticeRecommendation`: Audit-ready AI/instructor recommended study sets.
- `PracticePlan`: Draft session configuration (selection rules, targeted competencies, and spacing settings). Plans can be modified or regenerated.
- `PracticeSession`: Represents the actual runtime execution of a plan with active state transitions (`DRAFT -> GENERATED -> ACTIVE -> PAUSED -> COMPLETED -> ARCHIVED`).

### 2. Strategy Registry
Algorithms are registered dynamically in the `practice_strategy_registry` database table (strategy code, displayName, config schema, status) (Rec 2). Concrete selection strategies implement `QuestionSelectionStrategy` (`WeakestCompetencyFirst`, `BalancedCoverage`, `ExamBlueprintCoverage`, `DifficultyProgression`, `RandomWithinConstraints`) (Rec 8).

### 3. Recommendation Audit Logs
Every recommendation persists an audit record capturing: Input Snapshot, Algorithm Version, Decision Trace, and Output Payload (Rec 3). This guarantees complete AI transparency.

### 4. Adaptive Snapshot
Student competency and mastery values are snapshotted in `AdaptiveSnapshot` on student updates (Rec 4). This eliminates expensive joins across historical data during session generation.

### 5. Spaced Repetition Spacing Policy
A spacing policy governs question repetition across sessions (cooldown intervals: Correct = 7 days, Incorrect = 24h, Skipped = 12h) (Rec 10, 11).

### 6. Expanded Telemetry & Feedback
- Telemetry captures difficulty levels adjustments (previous level, current level, demotion/promotion reasons) (Rec 6).
- Student feedback captures perception of difficulty, confidence, satisfaction, usefulness, technical issue, and recommendation quality (Rec 12).

---

## Integration Rules & Cross-Domain Boundaries

- **READ-ONLY:** reads Student Learning Journey, Question Bank, Curriculum, Programme, and Exam Product.
- **WRITE-ONLY:** writes only to Adaptive Practice tables (plans, sessions, recommendations, statistics, feedback). Never mutates upstream domains.

---

## Performance Targets

| Operation | Target |
|---|---|
| Generate Session | < 500 ms |
| Recommendation | < 300 ms |
| Session Retrieval | < 200 ms |
| Eligibility Filter | < 150 ms |
| Strategy Execution | < 200 ms |
