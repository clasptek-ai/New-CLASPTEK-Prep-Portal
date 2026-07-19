# ADR-015 — AI Learning Coach Domain

**Status:** Accepted | **Implementation:** Complete | **Frozen:** Yes

**Date:** 2026-07-16

**Sprint:** 3.0

**Author:** Clasptek Engineering

---

## Context

Sprint 3.0 introduces the **AI Learning Coach Domain** to act as the student's personal AI tutor, providing daily study planning, revision campaigns, motivation alerts, streak management, guided reflection, and conversation capabilities. The coach bounded context operates as a coordinator and orchestrator: it consumes data from all preceding domains but persists no academic content of its own.

---

## Decision

### 1. Bounded Domain Boundaries & Aggregates
- `LearningCoach`: Represents the central coach identity and lifecycle control (status tracking). Delegates intelligence entirely to `CoachBrain`.
- `CoachBrain`: Separation of the coach's core intelligence. Manages coaching styles (tones, pacing), selected prompt templates, and active LLM configuration.
- `CoachMemory`: Persistent long-term learner profile (preferred study hours, learning style, strengths/weaknesses, recurring questions, and key milestones).
- `StudyGoal`: Goal aggregate root utilizing a state machine (`CREATED`, `ACTIVE`, `AT_RISK`, `PAUSED`, `COMPLETED`, `FAILED`, `ARCHIVED`) for fine-grained analytics.
- `CoachConversation`: Conversation session memory container holding message histories, token tracking, rolling summaries, and extracted conversational insights.
- `DailyStudyPlan`: Day-level study schedule generated for the student containing tasks, duration, and completion rates.
- `CoachingPlan`: Large-scale strategic plan (weekly, monthly, or exam-countdown plans).
- `HabitTracker`: Daily habit check-in tracker logging study time, mood, and focus indicators.
- `HabitAnalytics`: Pre-computed habit statistics tracking weekly/monthly consistency, streaks, and best study times.

### 2. Multi-Agent & LLM-Decoupled Architecture
- `CoachAgent` Interface: Ready for multi-agent expansion with `plan()`, `reflect()`, `motivate()`, and `coach()` methods.
- `LLMProvider` Interface: Decouples LLM implementations (OpenAI, Claude, Gemini) from core domain logic. Includes a rule-based mock implementation for deterministic local testing.
- `StudyPlanningEngine` / `RevisionPlanningEngine` / `GoalPlanningEngine` / `MotivationEngine`: Extensible, algorithm-separated domain service engines.

### 3. Registry-Driven Type Enforcement
All recommendations utilize structured types defined in a registry (`Practice`, `Revision`, `MockExam`, `Rest`, `Break`, `Motivation`, `Reflection`, `Goal`, `Resource`) instead of free-form text.

### 4. Async Projection for Dashboard
A dedicated `CoachDashboardProjection` aggregate acts as a read-model cache to serve `GET /api/v1/coach/dashboard` instantly without executing multiple cross-table aggregation queries on every request.

---

## Integration Rules & Cross-Domain Boundaries

- **Ports Strategy:** All cross-domain reads are enforced through explicit application Ports (`ReadinessInsightPort`, `EvaluationInsightPort`, etc.) to eliminate direct schema-level database coupling.
- **Academic Ownership:** The coach does not create or update questions, prediction outcomes, assessment scores, or student progress. It references their IDs only.

---

## Performance Targets

| Operation | Target |
|---|---|
| Retrieve Coach Profile | < 30 ms |
| Load Dashboard Projection | < 20 ms |
| Generate Daily Study Plan (Stubs) | < 100 ms |
| Save Conversation Message | < 50 ms |
| Compute Habit Analytics | < 120 ms |
| Load Conversation History | < 60 ms |
