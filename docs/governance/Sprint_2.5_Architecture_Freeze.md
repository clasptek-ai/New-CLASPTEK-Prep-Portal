# Sprint 2.5 — Architecture Freeze

**Status:** FROZEN
**Date:** 2026-07-16
**Sprint:** 2.5 — Student Learning Journey Domain
**ADR:** ADR-010

---

> [!IMPORTANT]
> This document is permanently frozen. Any changes to the contracts, interfaces, or schemas defined here require a new ADR and a new architecture freeze document.

---

## Frozen Aggregate Boundaries

### `StudentLearningJourney`

**Package:** `@clasptek/domain-student-learning`

Owns (frozen):

- `LearningGoal[]`
- `LearningMilestone[]`
- `CompetencyProgress[]` (with `CompetencyProgressHistoryEntry[]`)
- `StudySession[]` (with extended telemetry)
- `Achievement[]`
- `Bookmark[]` (generalized by `BookmarkResourceType`)
- `StreakCount`
- `JourneyHealth` (stub)
- Privacy fields (`consentGiven`, `dataRetentionPolicy`)

Does NOT own (frozen):

- Questions
- Assessment attempts
- Scores
- Curriculum
- Programme definitions
- Learning resources

### `StudentProgrammeEnrollment`

**Package:** `@clasptek/domain-student-learning`

Owns (frozen):

- Enrollment lifecycle (`ACTIVE → WITHDRAWN | SUSPENDED | COMPLETED`)
- `deliveryMode`, `cohortId`, `intakeDate`
- `paymentVerified`, `instructorId`, `completionCertificateId`
- `withdrawnAt`, `withdrawalReason`

### `LearningPlan`

**Package:** `@clasptek/domain-student-learning`

Owns (frozen):

- `LearningPlanVersion[]` keyed by `source: AI_GENERATED | INSTRUCTOR | STUDENT`
- Lifecycle: `ACTIVE | ARCHIVED | SUPERSEDED`

---

## Frozen Repository Contracts

All interfaces are in `@clasptek/application-student-learning`.

### `StudentLearningRepository`

```typescript
save(journey: StudentLearningJourney): Promise<void>
findById(id: string): Promise<StudentLearningJourney | null>
findByStudent(studentId: string): Promise<StudentLearningJourney | null>
findActive(studentId: string): Promise<StudentLearningJourney | null>
archive(id: string): Promise<void>
restore(id: string): Promise<void>
search(filters: StudentLearningSearchFilters): Promise<StudentLearningJourney[]>
nextIdentity(): string
```

### `ProgrammeEnrollmentRepository`

```typescript
save(enrollment: StudentProgrammeEnrollment): Promise<void>
findById(id: string): Promise<StudentProgrammeEnrollment | null>
findByJourney(journeyId: string): Promise<StudentProgrammeEnrollment[]>
findByStudentAndProgramme(studentId: string, programmeId: string): Promise<StudentProgrammeEnrollment | null>
findActive(journeyId: string): Promise<StudentProgrammeEnrollment[]>
nextIdentity(): string
```

### `LearningPlanRepository`

```typescript
save(plan: LearningPlan): Promise<void>
findById(id: string): Promise<LearningPlan | null>
findByJourney(journeyId: string): Promise<LearningPlan[]>
findActive(journeyId: string): Promise<LearningPlan | null>
nextIdentity(): string
```

### `DashboardProjectionRepository`

```typescript
save(projection: StudentDashboardProjection): Promise<void>
findByStudent(studentId: string): Promise<StudentDashboardProjection | null>
findByJourney(journeyId: string): Promise<StudentDashboardProjection | null>
```

---

## Frozen Database Schema

### Core Tables (15)

| Table                           | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `student_learning_journeys`     | Journey aggregate root             |
| `learning_goals`                | Student goals                      |
| `learning_milestones`           | Milestone records                  |
| `competency_progress`           | Mastery tracking                   |
| `competency_progress_history`   | Mastery audit trail (Rec 3)        |
| `study_sessions`                | Extended session telemetry (Rec 4) |
| `study_streaks`                 | Streak counter                     |
| `achievements`                  | Earned achievements                |
| `achievement_definitions`       | Catalogue (Rec 6)                  |
| `bookmarks`                     | Generalized bookmarks (Rec 7)      |
| `journey_health`                | Calculated health (Rec 8)          |
| `journey_events`                | Append-only event stream (Rec 2)   |
| `student_programme_enrollments` | Enrolment aggregate                |
| `learning_plans`                | Plan aggregate                     |
| `learning_plan_versions`        | Versioned plan (Rec 5)             |
| `student_dashboard_projections` | Read model (Rec 10)                |
| `journey_privacy_records`       | Privacy & compliance (Rec 12)      |

### Optimistic Locking

`lock_version` required on all transactional saves for:

- `student_learning_journeys`
- `student_programme_enrollments`
- `learning_plans`

### RLS

All student tables enforce `auth.uid() = student_id` via Supabase RLS.

---

## Frozen Domain Events (17)

| Event                     | Publisher                    |
| ------------------------- | ---------------------------- |
| `StudentJourneyCreated`   | `StudentLearningJourney`     |
| `StudentJourneyActivated` | `StudentLearningJourney`     |
| `StudentJourneyPaused`    | `StudentLearningJourney`     |
| `StudentJourneyArchived`  | `StudentLearningJourney`     |
| `ProgrammeEnrolled`       | `StudentProgrammeEnrollment` |
| `ProgrammeWithdrawn`      | `StudentProgrammeEnrollment` |
| `ProgrammeCompleted`      | `StudentProgrammeEnrollment` |
| `GoalCreated`             | `StudentLearningJourney`     |
| `GoalCompleted`           | `StudentLearningJourney`     |
| `StudySessionStarted`     | `StudentLearningJourney`     |
| `StudySessionEnded`       | `StudentLearningJourney`     |
| `StudyStreakUpdated`      | `StudentLearningJourney`     |
| `LessonCompleted`         | `StudentLearningJourney`     |
| `ModuleCompleted`         | `StudentLearningJourney`     |
| `MilestoneCompleted`      | `StudentLearningJourney`     |
| `CompetencyUpdated`       | `StudentLearningJourney`     |
| `AchievementUnlocked`     | `StudentLearningJourney`     |
| `BookmarkAdded`           | `StudentLearningJourney`     |
| `BookmarkRemoved`         | `StudentLearningJourney`     |
| `LearningPlanUpdated`     | `LearningPlan`               |

---

## REST API Contract (Frozen)

Base: `/api/v1/student/`

| Endpoint              | Method   | Handler                                           |
| --------------------- | -------- | ------------------------------------------------- |
| `journey`             | `GET`    | `GetJourneyHandler`                               |
| `journey`             | `POST`   | `CreateJourneyHandler` + `ActivateJourneyHandler` |
| `programmes`          | `GET`    | `GetEnrollmentsHandler`                           |
| `programmes`          | `POST`   | `EnrolProgrammeHandler`                           |
| `programmes/[id]`     | `PATCH`  | `WithdrawProgrammeHandler`                        |
| `goals`               | `GET`    | `GetJourneyHandler` (goals projection)            |
| `goals`               | `POST`   | `CreateLearningGoalHandler`                       |
| `goals/[id]`          | `PATCH`  | `CompleteGoalHandler`                             |
| `study-session/start` | `POST`   | `StartStudySessionHandler`                        |
| `study-session/end`   | `POST`   | `EndStudySessionHandler`                          |
| `bookmarks`           | `GET`    | `GetJourneyHandler` (bookmarks projection)        |
| `bookmarks`           | `POST`   | `BookmarkResourceHandler`                         |
| `bookmarks/[id]`      | `DELETE` | `RemoveBookmarkHandler`                           |
| `achievements`        | `GET`    | `GetJourneyHandler` (achievements projection)     |
| `dashboard`           | `GET`    | `GetDashboardHandler`                             |
| `statistics`          | `GET`    | `GetStudyStatisticsHandler`                       |
| `timeline`            | `GET`    | `GetJourneyHandler` (milestones timeline)         |
| `learning-plan`       | `GET`    | `GetLearningPlanHandler`                          |
| `learning-plan`       | `POST`   | `CreateLearningPlanHandler`                       |
| `archive`             | `POST`   | `ArchiveJourneyHandler`                           |

---

## Performance Targets (Frozen)

| Operation           | Target  | Mechanism                               |
| ------------------- | ------- | --------------------------------------- |
| Dashboard Load      | < 250ms | `StudentDashboardProjection` read model |
| Journey Retrieval   | < 150ms | Single row + indexed child loads        |
| Study Session Start | < 100ms | Journey upsert only                     |
| Programme Progress  | < 200ms | Enrollment index on `journey_id`        |
| Timeline            | < 300ms | Milestone index on `journey_id`         |

---

## Superseded By

None (current as of Sprint 2.5).
