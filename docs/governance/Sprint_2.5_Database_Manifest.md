# Sprint 2.5 — Database Manifest

**Sprint:** 2.5 — Student Learning Journey Domain
**Date:** 2026-07-16
**Status:** FINAL

---

## Migrations Delivered

| Migration | File                                 | Status  |
| --------- | ------------------------------------ | ------- |
| `00500`   | `00500_student_learning.sql`         | Applied |
| `00501`   | `00501_student_learning_seed.sql`    | Applied |
| `00502`   | `00502_student_learning_rls.sql`     | Applied |
| `00503`   | `00503_student_learning_indexes.sql` | Applied |

---

## Table Inventory

| Table                           | Rows (seed) | PK   | FK                       | Indexes                                           |
| ------------------------------- | ----------- | ---- | ------------------------ | ------------------------------------------------- |
| `student_learning_journeys`     | 0           | `id` | —                        | `student_id`, `status`                            |
| `learning_goals`                | 0           | `id` | `journey_id`             | `journey_id`, `status`, `goal_priority`           |
| `learning_milestones`           | 0           | `id` | `journey_id`             | `journey_id`, `completed`                         |
| `competency_progress`           | 0           | `id` | `journey_id`             | `(journey_id, competency_id)` UNIQUE              |
| `competency_progress_history`   | 0           | `id` | `competency_progress_id` | `competency_progress_id`, `recorded_at` (BRIN)    |
| `study_sessions`                | 0           | `id` | `journey_id`             | `journey_id`, `started_at` (BRIN)                 |
| `study_streaks`                 | 0           | `id` | `journey_id`             | `journey_id` UNIQUE                               |
| `achievements`                  | 0           | `id` | `journey_id`             | `journey_id`, `achievement_type`                  |
| `achievement_definitions`       | 12          | `id` | —                        | `code` UNIQUE, `achievement_type`                 |
| `bookmarks`                     | 0           | `id` | `journey_id`             | `(journey_id, resource_type, resource_id)` UNIQUE |
| `journey_health`                | 0           | `id` | `journey_id`             | `journey_id` UNIQUE                               |
| `journey_events`                | 0           | `id` | `journey_id`             | `journey_id`, `occurred_at` (BRIN), `event_name`  |
| `student_programme_enrollments` | 0           | `id` | `journey_id`             | `student_id`, `programme_id`, `enrollment_status` |
| `learning_plans`                | 0           | `id` | `journey_id`             | `journey_id`, `status`                            |
| `learning_plan_versions`        | 0           | `id` | `learning_plan_id`       | `(learning_plan_id, version_no)` UNIQUE           |
| `student_dashboard_projections` | 0           | `id` | `journey_id`             | `journey_id` UNIQUE, `student_id`                 |
| `journey_privacy_records`       | 0           | `id` | `journey_id`             | `journey_id` UNIQUE                               |

---

## RLS Policies

| Table                           | Policy                     | Rule                                 |
| ------------------------------- | -------------------------- | ------------------------------------ |
| `student_learning_journeys`     | `student_own_journey`      | `auth.uid() = student_id`            |
| `learning_goals`                | `student_own_goals`        | Via `student_learning_journeys` join |
| `study_sessions`                | `student_own_sessions`     | Via `student_learning_journeys` join |
| `competency_progress`           | `student_own_competencies` | Via `student_learning_journeys` join |
| `achievements`                  | `student_own_achievements` | Via `student_learning_journeys` join |
| `bookmarks`                     | `student_own_bookmarks`    | Via `student_learning_journeys` join |
| `student_programme_enrollments` | `student_own_enrollments`  | `auth.uid() = student_id`            |
| `learning_plans`                | `student_own_plans`        | `auth.uid() = student_id`            |
| `student_dashboard_projections` | `student_own_dashboard`    | `auth.uid() = student_id`            |
| `journey_privacy_records`       | `student_own_privacy`      | Via `student_learning_journeys` join |
| `achievement_definitions`       | `public_read`              | `SELECT` all                         |

---

## Optimistic Locking

| Table                           | Column         |
| ------------------------------- | -------------- |
| `student_learning_journeys`     | `lock_version` |
| `student_programme_enrollments` | `lock_version` |
| `learning_plans`                | `lock_version` |

Pattern: `WHERE lock_version = $n` on UPDATE, increment on conflict.

---

## Soft Delete

All primary tables include `deleted_at TIMESTAMPTZ` for soft delete support.

---

## Index Strategy

| Type             | Tables                                                                    |
| ---------------- | ------------------------------------------------------------------------- |
| B-Tree           | All `id`, `student_id`, `journey_id`, `status` columns                    |
| BRIN             | `started_at`, `recorded_at`, `occurred_at` (time-series data)             |
| Partial          | `status = 'ACTIVE'` on journeys and enrollments                           |
| Unique Composite | `(journey_id, competency_id)`, `(journey_id, resource_type, resource_id)` |

---

## Seed Data

**Achievement Definitions** (12 records):

| Code                 | Name                   | Type       |
| -------------------- | ---------------------- | ---------- |
| `FIRST_LESSON`       | First Lesson Completed | MILESTONE  |
| `FIRST_MODULE`       | First Module Completed | MILESTONE  |
| `FIRST_GOAL`         | First Goal Achieved    | MILESTONE  |
| `STREAK_7`           | 7-Day Study Streak     | STREAK     |
| `STREAK_30`          | 30-Day Study Streak    | STREAK     |
| `STREAK_100`         | 100-Day Study Streak   | STREAK     |
| `MASTERY_BRONZE`     | Bronze Mastery         | MASTERY    |
| `MASTERY_SILVER`     | Silver Mastery         | MASTERY    |
| `MASTERY_GOLD`       | Gold Mastery           | MASTERY    |
| `MASTERY_PLATINUM`   | Platinum Mastery       | MASTERY    |
| `COURSE_COMPLETE`    | Course Completed       | COMPLETION |
| `PROGRAMME_COMPLETE` | Programme Completed    | COMPLETION |
