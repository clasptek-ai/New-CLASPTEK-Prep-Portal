# Sprint 2.7 — Database Manifest

**Sprint:** 2.7 — Assessment Runtime Domain
**Date:** 2026-07-16
**Status:** FROZEN

---

This manifest records all schemas, constraints, Row Level Security rules, and indexes introduced in Sprint 2.7.

---

## 1. Schema Definitions

### `assessment_sessions`
Stores session execution container state.
- `id` UUID PRIMARY KEY
- `student_id` UUID NOT NULL
- `instance_id` UUID NOT NULL
- `status` VARCHAR(50) CHECK IN ('DRAFT', 'GENERATED', 'READY', 'ACTIVE', 'PAUSED', 'DISCONNECTED', 'RESUMED', 'SUBMITTING', 'SUBMITTED', 'EVALUATED', 'ARCHIVED')
- `resume_token` VARCHAR(255)
- `lock_version` INT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

### `answer_sheets`
Links answers to sessions.
- `id` UUID PRIMARY KEY
- `session_id` UUID UNIQUE REFERENCES assessment_sessions ON DELETE CASCADE
- `created_at` TIMESTAMPTZ

### `student_answers`
Stores answer payloads.
- `id` UUID PRIMARY KEY
- `sheet_id` UUID REFERENCES answer_sheets ON DELETE CASCADE
- `question_id` UUID NOT NULL
- `question_version_id` UUID NOT NULL
- `payload` JSONB NOT NULL
- `state` VARCHAR(50) CHECK IN ('UNANSWERED', 'ANSWERED', 'FLAGGED', 'SKIPPED')
- `time_spent_ms` INT
- `updated_at` TIMESTAMPTZ
- UNIQUE (sheet_id, question_version_id)

### `answer_revisions`
Provides audits for answer modifications.
- `id` UUID PRIMARY KEY
- `answer_id` UUID REFERENCES student_answers ON DELETE CASCADE
- `payload` JSONB NOT NULL
- `state` VARCHAR(50)
- `revision_number` INT
- `recorded_at` TIMESTAMPTZ

### `runtime_checkpoints`
Monotonically incremented state snapshots.
- `id` UUID PRIMARY KEY
- `session_id` UUID REFERENCES assessment_sessions ON DELETE CASCADE
- `checkpoint_version` INT
- `active_question_id` UUID
- `elapsed_time_ms` INT
- `answers_snapshot` JSONB NOT NULL
- `device_fingerprint` JSONB
- `connectivity_snapshot` JSONB
- `checksum` VARCHAR(255)
- `recorded_at` TIMESTAMPTZ
- UNIQUE (session_id, checkpoint_version)

### `navigation_history`
Tracks active visits logging.
- `id` UUID PRIMARY KEY
- `session_id` UUID REFERENCES assessment_sessions ON DELETE CASCADE
- `question_id` UUID NOT NULL
- `entered_at` TIMESTAMPTZ
- `exited_at` TIMESTAMPTZ
- `duration_ms` INT

### `runtime_heartbeats`
EMits client logs every 30s.
- `id` UUID PRIMARY KEY
- `session_id` UUID REFERENCES assessment_sessions ON DELETE CASCADE
- `elapsed_time_ms` INT
- `active_question_id` UUID
- `browser_visibility` VARCHAR(50)
- `network_status` VARCHAR(50)
- `recorded_at` TIMESTAMPTZ

### `security_incidents`
Tracks anomaly audits.
- `id` UUID PRIMARY KEY
- `session_id` UUID REFERENCES assessment_sessions ON DELETE CASCADE
- `incident_type` VARCHAR(100)
- `payload` JSONB
- `recorded_at` TIMESTAMPTZ

### `submission_records`
Holds final signed receipts.
- `id` UUID PRIMARY KEY
- `session_id` UUID UNIQUE REFERENCES assessment_sessions ON DELETE CASCADE
- `receipt_checksum` VARCHAR(255)
- `signature` VARCHAR(255)
- `server_id` VARCHAR(100)
- `submitted_at` TIMESTAMPTZ

---

## 2. Row Level Security Policies

Enabled on:
- `assessment_sessions`
- `answer_sheets`
- `student_answers`
- `answer_revisions`
- `runtime_checkpoints`
- `navigation_history`
- `runtime_heartbeats`
- `security_incidents`
- `submission_records`

Policy rules:
- Student user has SELECT/INSERT/UPDATE access for rows matching their UUID: `student_id = auth.uid()`.
- Access to child tables (`student_answers`, `runtime_checkpoints`, `security_incidents`, etc.) checks presence of parent session matching `s.student_id = auth.uid()`.

---

## 3. Performance Indexes

- B-tree on:
  - `assessment_sessions.student_id`
  - `answer_sheets.session_id`
  - `student_answers.sheet_id`
  - `runtime_checkpoints.session_id`
- Composite B-tree:
  - `(session_id, checkpoint_version)` inside `runtime_checkpoints` for recovery lookups.
  - `(sheet_id, question_version_id)` inside `student_answers` for quick save lookups.
