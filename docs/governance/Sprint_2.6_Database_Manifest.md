# Sprint 2.6 — Database Manifest

**Sprint:** 2.6 — Adaptive Practice Domain
**Date:** 2026-07-16
**Status:** FROZEN

---

This manifest records all schemas, constraints, Row Level Security rules, and indexes introduced in Sprint 2.6.

---

## 1. Schema Definitions

### `practice_strategy_registry`
Stores the registry of pluggable algorithms.
- `strategy_code` VARCHAR(100) PRIMARY KEY
- `display_name` VARCHAR(200) NOT NULL
- `algorithm_version` VARCHAR(50) NOT NULL
- `configuration_schema` JSONB
- `status` VARCHAR(50) CHECK IN ('ACTIVE', 'INACTIVE', 'DEPRECATED')

### `adaptive_snapshots`
Caches the student learning state to avoid expensive joins.
- `id` UUID PRIMARY KEY
- `student_id` UUID NOT NULL
- `competency_levels` JSONB NOT NULL
- `difficulty_profile` JSONB NOT NULL
- `weak_areas` JSONB NOT NULL
- `strengths` JSONB NOT NULL
- `recommendation_score` DECIMAL(5,2)

### `practice_recommendations`
Stores recommendation queue entries with decision trace audits.
- `id` UUID PRIMARY KEY
- `student_id` UUID NOT NULL
- `recommendation_rules` JSONB
- `recommendation_source` VARCHAR(100) NOT NULL
- `priority` VARCHAR(50) CHECK IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
- `priority_weight` DECIMAL(5,2)
- `status` VARCHAR(50) CHECK IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')
- `input_snapshot` JSONB NOT NULL
- `algorithm_version` VARCHAR(50) NOT NULL
- `decision_trace` JSONB NOT NULL
- `output_payload` JSONB NOT NULL
- `lock_version` INT

### `practice_plans`
Stores the planned session configurations.
- `id` UUID PRIMARY KEY
- `student_id` UUID NOT NULL
- `recommendation_id` UUID REFERENCES practice_recommendations
- `title` VARCHAR(200)
- `status` VARCHAR(50) CHECK IN ('DRAFT', 'GENERATED', 'SCHEDULED', 'DISCARDED')
- `selection_rules` JSONB NOT NULL
- `targeted_competencies` JSONB NOT NULL
- `spacing_policy` JSONB NOT NULL
- `lock_version` INT

### `practice_sessions`
Stores session execution state.
- `id` UUID PRIMARY KEY
- `student_id` UUID NOT NULL
- `plan_id` UUID REFERENCES practice_plans
- `status` VARCHAR(50) CHECK IN ('DRAFT', 'GENERATED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')
- `started_at` TIMESTAMPTZ
- `ended_at` TIMESTAMPTZ
- `duration_ms` INT
- `lock_version` INT

### `practice_session_questions`
Stores the questions loaded in the practice session queue.
- `id` UUID PRIMARY KEY
- `session_id` UUID REFERENCES practice_sessions ON DELETE CASCADE
- `question_version_id` UUID NOT NULL
- `order_index` INT NOT NULL
- `status` VARCHAR(50) CHECK IN ('PENDING', 'COMPLETED', 'SKIPPED')
- `accuracy` DECIMAL(5,2)
- `time_spent_ms` INT

### `practice_feedback`
Stores feedback logs.
- `id` UUID PRIMARY KEY
- `session_id` UUID REFERENCES practice_sessions ON DELETE CASCADE
- `rating` INT CHECK (rating BETWEEN 1 AND 5)
- `difficulty_perception` VARCHAR(100)
- `confidence` VARCHAR(100)
- `comment` TEXT

---

## 2. Row Level Security Policies

Enabled on:
- `adaptive_snapshots`
- `practice_recommendations`
- `practice_plans`
- `practice_sessions`
- `practice_session_questions`
- `practice_feedback`
- `practice_history`
- `practice_statistics`

Policy:
- Authenticated student has read/write access to rows where `student_id = auth.uid()`.
- Access to child tables (`practice_session_questions`, `practice_feedback`) checks presence of parent session where `s.student_id = auth.uid()`.
- Strategy Registry is open for select queries (`public_read_strategies`).

---

## 3. Performance Indexes

- B-tree: `student_id` fields, composite index on `(session_id, order_index)`
- BRIN: `started_at`, `recorded_at`, `completed_at` timestamps for large log scans.
