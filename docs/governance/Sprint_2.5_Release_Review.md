# Sprint 2.5 — Release Review

**Sprint:** 2.5 — Student Learning Journey Domain
**Date:** 2026-07-16
**Status:** COMPLETE
**Author:** Clasptek Engineering

---

## Executive Summary

Sprint 2.5 delivers the **Student Learning Journey Domain** — the canonical student state store for the Clasptek Prep Portal. This bounded context provides a structured, event-driven record of every student's academic engagement, separated into three aggregate roots: `StudentLearningJourney`, `StudentProgrammeEnrollment`, and `LearningPlan`.

---

## Scope Delivered

### Database (4 migrations)

| Migration                            | Description                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `00500_student_learning.sql`         | Core schema: 15 tables covering journey, goals, sessions, milestones, competencies, achievements, bookmarks, streaks, plans, health, privacy, dashboard projection |
| `00501_student_learning_seed.sql`    | Achievement definition catalogue seed data                                                                                                                         |
| `00502_student_learning_rls.sql`     | Row Level Security policies for all student tables                                                                                                                 |
| `00503_student_learning_indexes.sql` | Performance indexes (BRIN on timestamps, partial indexes on status)                                                                                                |

### Domain Package — `@clasptek/domain-student-learning`

| Category        | Count                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Domain Events   | 17                                                                         |
| Value Objects   | 4 (`CompletionPercentage`, `MasteryScore`, `StudyDuration`, `StreakCount`) |
| Entities        | 11                                                                         |
| Aggregate Roots | 3                                                                          |
| Domain Tests    | 34                                                                         |

### Application Package — `@clasptek/application-student-learning`

| Category                       | Count |
| ------------------------------ | ----- |
| Repository Interfaces (frozen) | 4     |
| Command Handlers               | 11    |
| Query Handlers                 | 5     |
| Application Tests              | 8     |

### Persistence — `@clasptek/persistence`

| Class                                   | Description                                                  |
| --------------------------------------- | ------------------------------------------------------------ |
| `PostgresStudentLearningRepository`     | Full CRUD + event stream append for `StudentLearningJourney` |
| `PostgresProgrammeEnrollmentRepository` | Full CRUD with optimistic locking                            |
| `PostgresLearningPlanRepository`        | Full CRUD with versioning                                    |
| `PostgresDashboardProjectionRepository` | Read model upsert + query                                    |

### Web API (10 routes)

| Route                                 | Methods    | Description                          |
| ------------------------------------- | ---------- | ------------------------------------ |
| `/api/v1/student/journey`             | `GET POST` | Create and retrieve learning journey |
| `/api/v1/student/programmes`          | `GET POST` | List and enrol in programmes         |
| `/api/v1/student/programmes/[id]`     | `PATCH`    | Withdraw from programme              |
| `/api/v1/student/goals`               | `GET POST` | Create and list learning goals       |
| `/api/v1/student/goals/[id]`          | `PATCH`    | Complete a goal                      |
| `/api/v1/student/study-session/start` | `POST`     | Start a study session                |
| `/api/v1/student/study-session/end`   | `POST`     | End a study session                  |
| `/api/v1/student/bookmarks`           | `GET POST` | Create and list bookmarks            |
| `/api/v1/student/bookmarks/[id]`      | `DELETE`   | Remove a bookmark                    |
| `/api/v1/student/achievements`        | `GET`      | List earned achievements             |
| `/api/v1/student/dashboard`           | `GET`      | Student dashboard projection         |
| `/api/v1/student/statistics`          | `GET`      | Study statistics                     |
| `/api/v1/student/timeline`            | `GET`      | Learning timeline                    |
| `/api/v1/student/learning-plan`       | `GET POST` | Versioned learning plan              |
| `/api/v1/student/archive`             | `POST`     | Archive journey                      |

### Architecture

| Deliverable                                  | Status              |
| -------------------------------------------- | ------------------- |
| ADR-010                                      | ✅ Accepted, Frozen |
| `student-learning-context.ts` DI container   | ✅ Created          |
| Root `tsconfig.json` references              | ✅ Updated          |
| Persistence `package.json` + `tsconfig.json` | ✅ Updated          |

---

## Test Results

| Suite                          | Tests  | Pass   | Fail  |
| ------------------------------ | ------ | ------ | ----- |
| `domain/student-learning`      | 34     | 34     | 0     |
| `application/student-learning` | 8      | 8      | 0     |
| **Total**                      | **42** | **42** | **0** |

---

## Build Status

| Package                                  | Build |
| ---------------------------------------- | ----- |
| `@clasptek/domain-student-learning`      | ✅    |
| `@clasptek/application-student-learning` | ✅    |
| `@clasptek/persistence` (typecheck)      | ✅    |

---

## Design Decisions

1. **Three aggregate roots** — `StudentLearningJourney`, `StudentProgrammeEnrollment`, `LearningPlan` are fully separated per user recommendation Rec 1.
2. **Append-only event stream** — domain events persisted to `journey_events` table per Rec 2.
3. **Competency history** — `CompetencyProgressHistoryEntry` appended on each update per Rec 3.
4. **Extended session telemetry** — device, platform, ip hash, timezone, idle time per Rec 4.
5. **Versioned learning plan** — `LearningPlanVersion[]` with AI/Instructor/Student source per Rec 5.
6. **Achievement catalogue** — `AchievementDefinition` decoupled from earned `Achievement` per Rec 6.
7. **Generalized bookmark** — `BookmarkResourceType` union covering all resource types per Rec 7.
8. **Journey health model** — `JourneyHealth` persisted, AI population deferred per Rec 8.
9. **Integration events** — 6 published events for consumer domains per Rec 9.
10. **Dashboard read model** — `StudentDashboardProjection` per Rec 10.
11. **Privacy stubs** — `journey_privacy_records` schema established per Rec 12.

---

## Recommendations for Sprint 2.6

1. Add `journey_events` consumer in Adaptive Practice domain
2. Implement dashboard projection refresh job (triggered on journey events)
3. Populate `JourneyHealth` from AI evaluation results
4. Add GDPR deletion workflow in `journey_privacy_records`
5. Implement `StudentLearningSearchFilters` with full-text search on Supabase
