# ADR-010 — Student Learning Journey Domain

**Status:** Accepted | **Implementation:** Complete | **Frozen:** Yes

**Date:** 2026-07-16

**Sprint:** 2.5

**Author:** Clasptek Engineering

---

## Context

Sprint 2.5 introduces the **Student Learning Journey Domain** as the canonical source of truth for every student's academic state. This is the first domain in the platform to store rich behavioural, temporal, and competency data about individual learners. The design decisions made here will directly influence how Adaptive Practice (Sprint 2.6), Assessment Runtime (Sprint 2.7), and AI Evaluation (Sprint 2.8) consume student state.

---

## Decision

### 1. Three Aggregate Roots

The domain exposes **three separate aggregate roots** rather than a single monolithic aggregate:

| Aggregate | Responsibility |
|---|---|
| `StudentLearningJourney` | Master lifecycle owner; owns goals, milestones, competencies, sessions, achievements, bookmarks, streak, preferences |
| `StudentProgrammeEnrollment` | Programme-level contract; owns enrollment date, payment state, cohort, instructor, completion certificates, withdrawal |
| `LearningPlan` | Versioned study plan; owns `LearningPlanVersion[]` keyed by source (AI/Instructor/Student) |

**Rationale:** Enrollment ownership concerns (payment, cohort, delivery mode) are explicitly separated from learning-state concerns (goals, progress, session history). This prevents enrollment logic from bloating the journey aggregate and allows enrollment to evolve independently (e.g., add Stripe payment verification without modifying journey).

### 2. Append-Only Journey Event Stream

All domain events emitted by `StudentLearningJourney` are persisted to the `journey_events` table as an **append-only event stream**. This provides:
- Replay capability for analytics and AI coaching
- Full audit trail for compliance and right-to-delete workflows
- Foundation for future event sourcing migration

### 3. Competency Progress History

Every `CompetencyProgress` update appends an immutable `CompetencyProgressHistoryEntry` to the `competency_progress_history` table, recording the previous score, new score, source, actor, and timestamp. This enables mastery trend analysis by future AI coaches without requiring separate analytics infrastructure.

### 4. Extended Study Session Telemetry

Study sessions capture: `deviceType`, `platform`, `ipHash` (hashed for privacy), `timezone`, `interruptionCount`, `idleTimeMs`, `completionReason`. This enriches the engagement analytics model for future adaptive recommendations.

### 5. Generalized Bookmark

Bookmarks support `LESSON | MODULE | QUESTION | RESOURCE | PROGRAMME` resource types. This avoids redesign when Question Bank and Learning Resources are consumed from this domain.

### 6. Achievement Definition Catalogue

`AchievementDefinition` is a separate table from `Achievement` (earned). This allows: badge definitions to be managed without touching earned records, future icon/description updates without affecting student histories, and AI-driven achievement creation.

### 7. Journey Health Model

`JourneyHealth` stores calculated engagement, consistency, velocity, inactivity, burnout risk, and recommendation priority fields. These are model stubs — **no prediction logic is computed in Sprint 2.5**. They are persisted as first-class fields to allow future AI evaluation domain to populate them.

### 8. Student Dashboard Projection (Read Model)

`StudentDashboardProjection` is a denormalized, optimized read model for the student dashboard UI. It is decoupled from the transactional aggregate to meet the `<250ms` dashboard load target. The projection is written by application layer handlers and consumed directly by the REST API.

### 9. Privacy & Compliance Stubs

`journey_privacy_records` stores consent status, data retention policy, deletion request timestamps, and audit access logs. Full GDPR workflows are deferred to a dedicated compliance sprint, but the **model is established here** to prevent structural rework later.

### 10. Integration Events

The following events are published by the domain for future subscriber consumption by Adaptive Practice, Assessment Runtime, and AI Evaluation:

- `ProgrammeEnrolled`
- `LessonCompleted`
- `ModuleCompleted`
- `CompetencyUpdated`
- `GoalCompleted`
- `StudentJourneyArchived`

---

## Performance Targets

| Operation | Target |
|---|---|
| Journey Retrieval | < 150 ms |
| Dashboard Load | < 250 ms |
| Programme Progress | < 200 ms |
| Timeline | < 300 ms |
| Study Session Start | < 100 ms |
| Goal Update | < 150 ms |

---

## Repository Contracts (Frozen)

### `StudentLearningRepository`
`save()` · `findById()` · `findByStudent()` · `findActive()` · `archive()` · `restore()` · `search()` · `nextIdentity()`

### `ProgrammeEnrollmentRepository`
`save()` · `findById()` · `findByJourney()` · `findByStudentAndProgramme()` · `findActive()` · `nextIdentity()`

### `LearningPlanRepository`
`save()` · `findById()` · `findByJourney()` · `findActive()` · `nextIdentity()`

### `DashboardProjectionRepository`
`save()` · `findByStudent()` · `findByJourney()`

> Breaking changes to these interfaces require a new ADR.

---

## Consequences

**Positive:**
- Enrollment lifecycle is cleanly separated; future payment/cohort logic has a clear home
- Event stream enables AI coaching and analytics replay without schema changes
- Competency history enables mastery trend analysis
- Read model meets dashboard performance targets
- Privacy model is in place for compliance sprints

**Negative:**
- Persistence hydration is complex (multiple child table loads per journey)
- Dashboard projection requires explicit update logic when journey state changes

---

## Supersedes

None.

## Superseded by

None (current).
