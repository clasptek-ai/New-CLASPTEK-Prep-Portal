-- Migration: 00700_assessment_runtime
-- Description: Core schema tables for Assessment Runtime

CREATE TABLE assessment_instances (
  id UUID PRIMARY KEY,
  question_sequence JSONB NOT NULL,
  timer_policy JSONB NOT NULL,
  navigation_policy JSONB NOT NULL,
  autosave_policy JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  instance_id UUID REFERENCES assessment_instances(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'GENERATED', 'READY', 'ACTIVE', 'PAUSED', 'DISCONNECTED', 'RESUMED', 'SUBMITTING', 'SUBMITTED', 'EVALUATED', 'ARCHIVED')),
  resume_token VARCHAR(500),
  lock_version INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE answer_sheets (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE student_answers (
  id UUID PRIMARY KEY,
  sheet_id UUID REFERENCES answer_sheets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_version_id UUID NOT NULL,
  payload JSONB,
  state VARCHAR(50) DEFAULT 'UNANSWERED' NOT NULL CHECK (state IN ('UNANSWERED', 'ANSWERED', 'FLAGGED', 'SKIPPED')),
  time_spent_ms INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(sheet_id, question_version_id)
);

CREATE TABLE answer_revisions (
  id UUID PRIMARY KEY,
  answer_id UUID REFERENCES student_answers(id) ON DELETE CASCADE,
  payload JSONB,
  state VARCHAR(50) NOT NULL,
  revision_number INT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE runtime_checkpoints (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  checkpoint_version INT NOT NULL,
  active_question_id UUID,
  elapsed_time_ms INT NOT NULL,
  answers_snapshot JSONB NOT NULL,
  device_fingerprint JSONB,
  connectivity_snapshot JSONB,
  checksum VARCHAR(256),
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE session_timers (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE UNIQUE,
  timer_type VARCHAR(100) NOT NULL,
  limit_ms INT,
  elapsed_ms INT DEFAULT 0 NOT NULL,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ
);

CREATE TABLE navigation_history (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_ms INT
);

CREATE TABLE submission_records (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE UNIQUE,
  receipt_checksum VARCHAR(256) NOT NULL,
  signature VARCHAR(500) NOT NULL,
  server_id VARCHAR(100) NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE security_incidents (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  incident_type VARCHAR(100) NOT NULL,
  payload JSONB,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE runtime_heartbeats (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  elapsed_time_ms INT NOT NULL,
  active_question_id UUID,
  browser_visibility VARCHAR(50) NOT NULL,
  network_status VARCHAR(50) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE runtime_statistics (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE UNIQUE,
  answer_save_latencies JSONB,
  checkpoint_latencies JSONB,
  submission_latency_ms INT,
  heartbeat_failures INT DEFAULT 0 NOT NULL,
  reconnect_count INT DEFAULT 0 NOT NULL,
  autosave_failures INT DEFAULT 0 NOT NULL,
  security_incidents_count INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
