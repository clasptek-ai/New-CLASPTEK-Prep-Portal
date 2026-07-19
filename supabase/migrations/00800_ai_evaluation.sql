-- Migration: 00800_ai_evaluation
-- Description: Core schema tables for AI Evaluation & Scoring Domain

-- ─────────────────────────────────────────────
-- AI MODEL REGISTRY
-- ─────────────────────────────────────────────

CREATE TABLE ai_models (
  id UUID PRIMARY KEY,
  provider VARCHAR(100) NOT NULL CHECK (provider IN ('OPENAI', 'AZURE_OPENAI', 'ANTHROPIC', 'GOOGLE_GEMINI', 'LOCAL', 'MOCK')),
  model_code VARCHAR(200) NOT NULL,
  display_name VARCHAR(300) NOT NULL,
  capabilities JSONB NOT NULL DEFAULT '[]',
  configuration_schema JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (provider, model_code)
);

CREATE TABLE model_versions (
  id UUID PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES ai_models(id),
  version_tag VARCHAR(100) NOT NULL,
  prompt_hash VARCHAR(64),
  configuration JSONB,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  deprecated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (model_id, version_tag)
);

-- ─────────────────────────────────────────────
-- EVALUATION PROFILES  (Rec 4)
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_profiles (
  id UUID PRIMARY KEY,
  profile_code VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(300) NOT NULL,
  exam_context VARCHAR(200),
  model_id UUID REFERENCES ai_models(id),
  rubric_reference JSONB,
  confidence_threshold NUMERIC(5,4) NOT NULL DEFAULT 0.70,
  moderation_policy VARCHAR(100) NOT NULL DEFAULT 'AUTO' CHECK (moderation_policy IN ('AUTO', 'ALWAYS_HUMAN', 'THRESHOLD_BASED', 'SAMPLE_BASED')),
  settings JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- PROMPT MANAGEMENT  (Rec 2)
-- ─────────────────────────────────────────────

CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY,
  template_code VARCHAR(200) NOT NULL UNIQUE,
  display_name VARCHAR(300) NOT NULL,
  question_type VARCHAR(100),
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES prompt_templates(id),
  version_number INT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  prompt_hash VARCHAR(64) NOT NULL,
  change_notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (template_id, version_number)
);

-- ─────────────────────────────────────────────
-- EVALUATION SNAPSHOT  (Rec 1)
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_snapshots (
  id UUID PRIMARY KEY,
  submission_id UUID NOT NULL,
  session_id UUID NOT NULL,
  student_id UUID NOT NULL,
  question_snapshot JSONB NOT NULL,
  rubric_snapshot JSONB NOT NULL,
  submission_snapshot JSONB NOT NULL,
  model_version_id UUID REFERENCES model_versions(id),
  prompt_version_id UUID REFERENCES prompt_versions(id),
  evaluation_settings JSONB NOT NULL DEFAULT '{}',
  profile_id UUID REFERENCES evaluation_profiles(id),
  snapshotted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- EVALUATION JOBS (Async queue)
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_jobs (
  id UUID PRIMARY KEY,
  snapshot_id UUID NOT NULL REFERENCES evaluation_snapshots(id),
  student_id UUID NOT NULL,
  submission_id UUID NOT NULL,
  question_type VARCHAR(100) NOT NULL CHECK (question_type IN ('OBJECTIVE', 'ESSAY', 'WRITING', 'SPEAKING', 'CODING', 'STRUCTURED')),
  status VARCHAR(100) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'HUMAN_REVIEW_REQUIRED', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  priority INT NOT NULL DEFAULT 5,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  profile_id UUID REFERENCES evaluation_profiles(id),
  model_version_id UUID REFERENCES model_versions(id),
  error_message TEXT,
  queued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  lock_version INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- PROMPT EXECUTIONS  (Rec 5 — Prompt Audit)
-- ─────────────────────────────────────────────

CREATE TABLE prompt_executions (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES evaluation_jobs(id) ON DELETE CASCADE,
  prompt_version_id UUID REFERENCES prompt_versions(id),
  model_version_id UUID REFERENCES model_versions(id),
  provider VARCHAR(100) NOT NULL,
  model_code VARCHAR(200) NOT NULL,
  system_prompt_hash VARCHAR(64) NOT NULL,
  user_prompt_hash VARCHAR(64) NOT NULL,
  temperature NUMERIC(4,3),
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  latency_ms INT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'COMPLETED', 'FAILED', 'TIMEOUT')),
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- EVALUATION RESULTS
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_results (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES evaluation_jobs(id) ON DELETE CASCADE UNIQUE,
  snapshot_id UUID NOT NULL REFERENCES evaluation_snapshots(id),
  student_id UUID NOT NULL,
  submission_id UUID NOT NULL,
  question_type VARCHAR(100) NOT NULL,
  raw_score NUMERIC(10,4),
  scaled_score NUMERIC(10,4),
  band_score VARCHAR(50),
  max_score NUMERIC(10,4),
  score_percentage NUMERIC(7,4),
  is_correct BOOLEAN,
  confidence NUMERIC(5,4),
  evaluation_notes TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  lock_version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- RUBRIC SCORES
-- ─────────────────────────────────────────────

CREATE TABLE rubric_scores (
  id UUID PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES evaluation_results(id) ON DELETE CASCADE,
  criterion_code VARCHAR(200) NOT NULL,
  criterion_name VARCHAR(300) NOT NULL,
  score NUMERIC(10,4) NOT NULL,
  max_score NUMERIC(10,4) NOT NULL,
  band_descriptor VARCHAR(200),
  justification TEXT,
  weight NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- FEEDBACK SECTIONS
-- ─────────────────────────────────────────────

CREATE TABLE feedback_sections (
  id UUID PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES evaluation_results(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL CHECK (section_type IN ('OVERALL', 'STRENGTHS', 'IMPROVEMENTS', 'EXAMPLES', 'NEXT_STEPS', 'CRITERION')),
  criterion_code VARCHAR(200),
  content TEXT NOT NULL,
  severity VARCHAR(50) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- EVIDENCE REFERENCES
-- ─────────────────────────────────────────────

CREATE TABLE evidence_references (
  id UUID PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES evaluation_results(id) ON DELETE CASCADE,
  criterion_code VARCHAR(200),
  text_excerpt TEXT NOT NULL,
  start_offset INT,
  end_offset INT,
  relevance_note TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- RECOMMENDATIONS
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_recommendations (
  id UUID PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES evaluation_results(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  recommendation_type VARCHAR(100) NOT NULL CHECK (recommendation_type IN ('COMPETENCY_GAP', 'PRACTICE_TOPIC', 'STUDY_RESOURCE', 'SKILL_DRILL', 'REVIEW_CONCEPT')),
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  target_competency_code VARCHAR(200),
  target_topic_code VARCHAR(200),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- CALIBRATION  (Rec 3)
-- ─────────────────────────────────────────────

CREATE TABLE calibration_results (
  id UUID PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES evaluation_results(id) ON DELETE CASCADE,
  expected_score NUMERIC(10,4),
  observed_score NUMERIC(10,4) NOT NULL,
  calibration_error NUMERIC(10,6),
  reviewer_agreement_rate NUMERIC(5,4),
  drift_indicator VARCHAR(50) CHECK (drift_indicator IN ('STABLE', 'DRIFTING_UP', 'DRIFTING_DOWN', 'VOLATILE')),
  calibration_notes TEXT,
  calibrated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- HUMAN REVIEWS  (Rec 6 — Expanded States)
-- ─────────────────────────────────────────────

CREATE TABLE human_reviews (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES evaluation_jobs(id) ON DELETE CASCADE,
  result_id UUID REFERENCES evaluation_results(id),
  reviewer_id UUID,
  status VARCHAR(100) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_REVIEW', 'ESCALATED', 'APPROVED', 'REJECTED', 'PUBLISHED')),
  escalation_reason TEXT,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  review_started_at TIMESTAMPTZ,
  review_completed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  lock_version INT NOT NULL DEFAULT 0
);

CREATE TABLE review_comments (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES human_reviews(id) ON DELETE CASCADE,
  criterion_code VARCHAR(200),
  comment_text TEXT NOT NULL,
  decision VARCHAR(50) CHECK (decision IN ('APPROVE', 'REJECT', 'OVERRIDE', 'FLAG')),
  override_score NUMERIC(10,4),
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- EVALUATION METRICS  (Rec 7)
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_metrics (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES evaluation_jobs(id) ON DELETE CASCADE UNIQUE,
  ai_latency_ms INT,
  total_tokens INT,
  prompt_tokens INT,
  completion_tokens INT,
  confidence_score NUMERIC(5,4),
  rubric_completion_time_ms INT,
  average_criterion_latency_ms INT,
  reviewer_override_applied BOOLEAN NOT NULL DEFAULT FALSE,
  model_agreement_score NUMERIC(5,4),
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─────────────────────────────────────────────
-- EVALUATION AUDIT (Append-only)
-- ─────────────────────────────────────────────

CREATE TABLE evaluation_audit (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES evaluation_jobs(id),
  event_name VARCHAR(200) NOT NULL,
  previous_status VARCHAR(100),
  next_status VARCHAR(100),
  actor_id UUID,
  payload JSONB,
  occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
