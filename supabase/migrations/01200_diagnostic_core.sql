-- Migration: 01200_diagnostic_core.sql
-- Description: Core Schema for Diagnostic Assessment & Placement Domain
-- Bounded Context: Diagnostic Assessment & Placement

-- 1. Diagnostic Catalog Table
CREATE TABLE IF NOT EXISTS diagnostic_catalogs (
  id UUID PRIMARY KEY,
  exam_product_id UUID NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  version_no INT DEFAULT 1 NOT NULL,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- 2. Assessment Forms Table
CREATE TABLE IF NOT EXISTS assessment_forms (
  id UUID PRIMARY KEY,
  catalog_id UUID NOT NULL REFERENCES diagnostic_catalogs(id) ON DELETE CASCADE,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 30 NOT NULL,
  total_questions INT DEFAULT 20 NOT NULL,
  blueprint_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- 3. Diagnostic Attempts Table
CREATE TABLE IF NOT EXISTS diagnostic_attempts (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  catalog_id UUID NOT NULL REFERENCES diagnostic_catalogs(id),
  status VARCHAR(50) DEFAULT 'STARTED' NOT NULL CHECK (status IN ('STARTED', 'SUBMITTED', 'COMPLETED', 'ABANDONED')),
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  closed_at TIMESTAMPTZ,
  score DECIMAL(5,2),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- 4. Diagnostic Responses Table
CREATE TABLE IF NOT EXISTS diagnostic_responses (
  id UUID PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES diagnostic_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_version_id UUID NOT NULL,
  response_payload JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_ms INT DEFAULT 0 NOT NULL,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Placement Results Table
CREATE TABLE IF NOT EXISTS placement_results (
  id UUID PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES diagnostic_attempts(id) ON DELETE CASCADE UNIQUE,
  student_id UUID NOT NULL,
  placement_stage VARCHAR(100) NOT NULL CHECK (placement_stage IN ('Foundation', 'Beginner', 'Intermediate', 'Advanced', 'Exam Ready')),
  confidence_percentage DECIMAL(5,2) NOT NULL,
  reliability_score DECIMAL(5,2) NOT NULL,
  blueprint_coverage DECIMAL(5,2) NOT NULL,
  difficulty_coverage DECIMAL(5,2) NOT NULL,
  questions_answered INT NOT NULL,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Student Skill Profiles Table
CREATE TABLE IF NOT EXISTS student_skill_profiles (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  skill_code VARCHAR(100) NOT NULL,
  mastery_percentage DECIMAL(5,2) NOT NULL,
  computed_stage VARCHAR(100) NOT NULL CHECK (computed_stage IN ('Foundation', 'Beginner', 'Intermediate', 'Advanced', 'Exam Ready')),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(student_id, skill_code)
);

-- 7. Diagnostic Recommendations Table
CREATE TABLE IF NOT EXISTS diagnostic_recommendations (
  id UUID PRIMARY KEY,
  placement_result_id UUID NOT NULL REFERENCES placement_results(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  recommended_learning_path_id UUID NOT NULL,
  priority INT DEFAULT 1 NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED', 'DISMISSED')),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Exposure Ledger Table
CREATE TABLE IF NOT EXISTS exposure_ledger (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  question_id UUID NOT NULL,
  attempt_id UUID REFERENCES diagnostic_attempts(id) ON DELETE SET NULL,
  rendered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
);

-- 9. Selection Audits Table
CREATE TABLE IF NOT EXISTS selection_audits (
  id UUID PRIMARY KEY,
  attempt_id UUID REFERENCES diagnostic_attempts(id) ON DELETE SET NULL,
  question_id UUID NOT NULL,
  selection_reason VARCHAR(255) NOT NULL,
  random_seed VARCHAR(100),
  selected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
);
