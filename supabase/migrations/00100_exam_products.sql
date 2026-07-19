-- DDL Schema for Canonical Exam Product Domain V3
-- Milestone 1 to 5 Table Definitions

-- Omit all legacy stubs and start with clean drops of V3 tables if they exist
DROP VIEW IF EXISTS vw_assessment_blueprints CASCADE;
DROP VIEW IF EXISTS vw_learning_paths CASCADE;
DROP VIEW IF EXISTS vw_skill_hierarchy CASCADE;
DROP VIEW IF EXISTS vw_exam_products CASCADE;

DROP TABLE IF EXISTS clasptek_product_metadata CASCADE;
DROP TABLE IF EXISTS exam_board_metadata CASCADE;
DROP TABLE IF EXISTS exam_regional_variants CASCADE;
DROP TABLE IF EXISTS exam_delivery_configurations CASCADE;
DROP TABLE IF EXISTS adaptive_exam_profiles CASCADE;
DROP TABLE IF EXISTS exam_score_scales CASCADE;
DROP TABLE IF EXISTS exam_score_schemes CASCADE;
DROP TABLE IF EXISTS readiness_criteria CASCADE;
DROP TABLE IF EXISTS readiness_frameworks CASCADE;
DROP TABLE IF EXISTS learning_path_nodes CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS learning_frameworks CASCADE;
DROP TABLE IF EXISTS diagnostic_rules CASCADE;
DROP TABLE IF EXISTS diagnostic_frameworks CASCADE;
DROP TABLE IF EXISTS skill_relations CASCADE;
DROP TABLE IF EXISTS skill_levels CASCADE;
DROP TABLE IF EXISTS skill_revisions CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skill_framework_versions CASCADE;
DROP TABLE IF EXISTS skill_frameworks CASCADE;
DROP TABLE IF EXISTS assessment_blueprint_skill_mappings CASCADE;
DROP TABLE IF EXISTS assessment_blueprint_items CASCADE;
DROP TABLE IF EXISTS assessment_blueprints CASCADE;
DROP TABLE IF EXISTS assessment_item_types CASCADE;
DROP TABLE IF EXISTS official_exam_components CASCADE;
DROP TABLE IF EXISTS official_exam_structures CASCADE;
DROP TABLE IF EXISTS exam_product_versions CASCADE;
DROP TABLE IF EXISTS exam_products CASCADE;
DROP TABLE IF EXISTS outbox_events CASCADE;

-- Transactional Outbox Events Table
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NULL
);

-- MILESTONE 1: Core Tables

CREATE TABLE exam_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  product_family text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  current_version_id uuid, -- FK added after versions table
  current_version_no text,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE exam_product_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  version_no text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  name text NOT NULL,
  description text,
  official_board_name text,
  official_board_code text,
  official_website text,
  duration_minutes integer CHECK (duration_minutes > 0),
  validity_period_months integer CHECK (validity_period_months >= 0),
  primary_language_code text NOT NULL DEFAULT 'en',
  exam_type text CHECK (exam_type IN ('ADAPTIVE', 'LINEAR', 'HYBRID')),
  change_summary text,
  effective_from timestamptz,
  effective_to timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  retired_at timestamptz,
  retired_by uuid REFERENCES users(id) ON DELETE SET NULL,
  version_no_int integer NOT NULL DEFAULT 1 CHECK (version_no_int > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE official_exam_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  board_structure_version text,
  description text,
  effective_from timestamptz,
  effective_to timestamptz,
  source_reference text,
  is_current_official_structure boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE official_exam_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  official_exam_structure_id uuid NOT NULL REFERENCES official_exam_structures(id) ON DELETE CASCADE,
  parent_component_id uuid REFERENCES official_exam_components(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  component_type text NOT NULL,
  display_order integer NOT NULL CHECK (display_order >= 0),
  is_required boolean NOT NULL DEFAULT true,
  is_scored boolean NOT NULL DEFAULT true,
  is_timed boolean NOT NULL DEFAULT false,
  duration_minutes integer CHECK (duration_minutes >= 0),
  weight_percentage numeric(5,2) CHECK (weight_percentage >= 0.00 AND weight_percentage <= 100.00),
  minimum_items integer CHECK (minimum_items >= 0),
  maximum_items integer CHECK (maximum_items >= 0),
  metadata_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);


-- MILESTONE 2: Assessment Tables

CREATE TABLE assessment_item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  response_mode text,
  scoring_mode text,
  supports_partial_credit boolean NOT NULL DEFAULT false,
  requires_stimulus boolean NOT NULL DEFAULT false,
  requires_media boolean NOT NULL DEFAULT false,
  allows_multiple_responses boolean NOT NULL DEFAULT false,
  schema_version text,
  configuration_schema_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE assessment_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  official_exam_component_id uuid NOT NULL REFERENCES official_exam_components(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  blueprint_version text,
  minimum_total_items integer CHECK (minimum_total_items >= 0),
  maximum_total_items integer CHECK (maximum_total_items >= 0),
  target_total_items integer CHECK (target_total_items >= 0),
  total_weight_percentage numeric(5,2) CHECK (total_weight_percentage >= 0.00 AND total_weight_percentage <= 100.00),
  time_budget_minutes integer CHECK (time_budget_minutes >= 0),
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE assessment_blueprint_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_blueprint_id uuid NOT NULL REFERENCES assessment_blueprints(id) ON DELETE CASCADE,
  assessment_item_type_id uuid NOT NULL REFERENCES assessment_item_types(id) ON DELETE CASCADE,
  difficulty_level_id uuid, -- Reference to difficulty taxonomy level (UUID)
  cognitive_level_id uuid,  -- Reference to cognitive level (UUID)
  evidence_type_id uuid,    -- Reference to evidence type (UUID)
  skill_group_id uuid,      -- Reference to skill group (UUID)
  code text NOT NULL,
  name text NOT NULL,
  description text,
  minimum_item_count integer CHECK (minimum_item_count >= 0),
  maximum_item_count integer CHECK (maximum_item_count >= 0),
  target_item_count integer CHECK (target_item_count >= 0),
  weight_percentage numeric(5,2) CHECK (weight_percentage >= 0.00 AND weight_percentage <= 100.00),
  time_budget_minutes integer CHECK (time_budget_minutes >= 0),
  is_required boolean NOT NULL DEFAULT true,
  adaptive_stage_code text,
  selection_policy text,
  configuration_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);


-- MILESTONE 3: Skills Tables

CREATE TABLE skill_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'DRAFT',
  current_version_id uuid, -- FK added after framework versions table
  current_version_no text,
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE skill_framework_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_framework_id uuid NOT NULL REFERENCES skill_frameworks(id) ON DELETE CASCADE,
  version_no text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  name text NOT NULL,
  description text,
  change_summary text,
  effective_from timestamptz,
  effective_to timestamptz,
  published_at timestamptz,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  version_no_int integer NOT NULL DEFAULT 1 CHECK (version_no_int > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_framework_id uuid NOT NULL REFERENCES skill_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  canonical_name text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  current_revision_id uuid, -- FK added after revisions table
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE skill_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  skill_framework_version_id uuid NOT NULL REFERENCES skill_framework_versions(id) ON DELETE CASCADE,
  revision_no integer NOT NULL CHECK (revision_no > 0),
  parent_skill_revision_id uuid REFERENCES skill_revisions(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text,
  domain text,
  is_leaf_skill boolean NOT NULL DEFAULT true,
  assessment_capability boolean NOT NULL DEFAULT true,
  learning_capability boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE skill_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_framework_version_id uuid NOT NULL REFERENCES skill_framework_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  ordinal_position integer NOT NULL CHECK (ordinal_position >= 0),
  minimum_mastery_percentage numeric(5,2) CHECK (minimum_mastery_percentage >= 0.00 AND minimum_mastery_percentage <= 100.00),
  maximum_mastery_percentage numeric(5,2) CHECK (maximum_mastery_percentage >= 0.00 AND maximum_mastery_percentage <= 100.00),
  equivalent_framework text,
  equivalent_level text,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE skill_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_framework_version_id uuid NOT NULL REFERENCES skill_framework_versions(id) ON DELETE CASCADE,
  source_skill_revision_id uuid NOT NULL REFERENCES skill_revisions(id) ON DELETE CASCADE,
  target_skill_revision_id uuid NOT NULL REFERENCES skill_revisions(id) ON DELETE CASCADE,
  relation_type text NOT NULL,
  strength numeric(3,2) CHECK (strength >= 0.00 AND strength <= 1.00),
  is_mandatory boolean NOT NULL DEFAULT false,
  rationale text,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE assessment_blueprint_skill_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_blueprint_item_id uuid NOT NULL REFERENCES assessment_blueprint_items(id) ON DELETE CASCADE,
  skill_revision_id uuid NOT NULL REFERENCES skill_revisions(id) ON DELETE CASCADE,
  skill_level_id uuid REFERENCES skill_levels(id) ON DELETE SET NULL,
  mapping_type text NOT NULL DEFAULT 'PRIMARY',
  importance_weight numeric(5,2) CHECK (importance_weight >= 0.00 AND importance_weight <= 100.00),
  is_primary boolean NOT NULL DEFAULT true,
  minimum_evidence_count integer DEFAULT 1 CHECK (minimum_evidence_count >= 0),
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);


-- MILESTONE 4: Learning Tables

CREATE TABLE learning_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  skill_framework_version_id uuid NOT NULL REFERENCES skill_framework_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  framework_version text,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_framework_id uuid NOT NULL REFERENCES learning_frameworks(id) ON DELETE CASCADE,
  parent_path_id uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  path_type text NOT NULL,
  level_code text,
  display_order integer NOT NULL CHECK (display_order >= 0),
  recommended_duration_hours numeric(5,2) CHECK (recommended_duration_hours >= 0.00),
  entry_requirement_summary text,
  exit_requirement_summary text,
  is_required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE learning_path_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  skill_revision_id uuid NOT NULL REFERENCES skill_revisions(id) ON DELETE CASCADE,
  skill_level_id uuid REFERENCES skill_levels(id) ON DELETE SET NULL,
  official_exam_component_id uuid REFERENCES official_exam_components(id) ON DELETE SET NULL,
  node_type text NOT NULL,
  sequence_no integer NOT NULL CHECK (sequence_no >= 0),
  is_required boolean NOT NULL DEFAULT true,
  estimated_learning_minutes integer CHECK (estimated_learning_minutes >= 0),
  entry_mastery_percentage numeric(5,2) CHECK (entry_mastery_percentage >= 0.00 AND entry_mastery_percentage <= 100.00),
  exit_mastery_percentage numeric(5,2) CHECK (exit_mastery_percentage >= 0.00 AND exit_mastery_percentage <= 100.00),
  configuration_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE readiness_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  target_score_scheme_id uuid, -- FK added after scoring table
  evaluation_strategy text,
  minimum_confidence numeric(3,2) CHECK (minimum_confidence >= 0.00 AND minimum_confidence <= 1.00),
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE readiness_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_framework_id uuid NOT NULL REFERENCES readiness_frameworks(id) ON DELETE CASCADE,
  official_exam_component_id uuid REFERENCES official_exam_components(id) ON DELETE SET NULL,
  skill_revision_id uuid REFERENCES skill_revisions(id) ON DELETE SET NULL,
  skill_level_id uuid REFERENCES skill_levels(id) ON DELETE SET NULL,
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
  criterion_type text NOT NULL,
  operator text,
  target_value numeric(5,2),
  minimum_value numeric(5,2),
  maximum_value numeric(5,2),
  weight numeric(5,2) CHECK (weight >= 0.00),
  is_mandatory boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 1 CHECK (priority >= 1),
  evidence_window_days integer CHECK (evidence_window_days > 0),
  configuration_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE diagnostic_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  framework_type text NOT NULL,
  minimum_evidence_count integer CHECK (minimum_evidence_count >= 0),
  confidence_threshold numeric(3,2) CHECK (confidence_threshold >= 0.00 AND confidence_threshold <= 1.00),
  fallback_learning_path_id uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE diagnostic_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_framework_id uuid NOT NULL REFERENCES diagnostic_frameworks(id) ON DELETE CASCADE,
  official_exam_component_id uuid REFERENCES official_exam_components(id) ON DELETE SET NULL,
  skill_revision_id uuid REFERENCES skill_revisions(id) ON DELETE SET NULL,
  skill_level_id uuid REFERENCES skill_levels(id) ON DELETE SET NULL,
  recommended_learning_path_id uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
  rule_type text NOT NULL,
  operator text,
  minimum_value numeric(5,2),
  maximum_value numeric(5,2),
  weight numeric(5,2) CHECK (weight >= 0.00),
  priority integer NOT NULL DEFAULT 1 CHECK (priority >= 1),
  minimum_evidence_count integer CHECK (minimum_evidence_count >= 0),
  confidence_threshold numeric(3,2) CHECK (confidence_threshold >= 0.00 AND confidence_threshold <= 1.00),
  condition_json jsonb,
  explanation_template text,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);


-- MILESTONE 5: Scoring and Configurations

CREATE TABLE exam_score_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  official_exam_component_id uuid REFERENCES official_exam_components(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  scheme_type text NOT NULL,
  is_overall_scheme boolean NOT NULL DEFAULT false,
  minimum_score numeric(5,2) NOT NULL CHECK (minimum_score >= 0.00),
  maximum_score numeric(5,2) NOT NULL CHECK (maximum_score >= minimum_score),
  score_step numeric(5,2) CHECK (score_step > 0.00),
  passing_score numeric(5,2) CHECK (passing_score >= minimum_score AND passing_score <= maximum_score),
  decimal_places integer DEFAULT 0 CHECK (decimal_places >= 0),
  aggregation_method text,
  rounding_method text,
  display_format text,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Link readiness target score scheme back
ALTER TABLE readiness_frameworks ADD CONSTRAINT fk_target_score_scheme FOREIGN KEY (target_score_scheme_id) REFERENCES exam_score_schemes(id) ON DELETE SET NULL;

CREATE TABLE exam_score_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_score_scheme_id uuid NOT NULL REFERENCES exam_score_schemes(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  minimum_value numeric(5,2) NOT NULL,
  maximum_value numeric(5,2) NOT NULL CHECK (maximum_value >= minimum_value),
  ordinal_position integer NOT NULL CHECK (ordinal_position >= 0),
  result_classification text,
  description text,
  equivalent_framework text,
  equivalent_level text,
  is_passing boolean NOT NULL DEFAULT true,
  metadata_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE adaptive_exam_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  official_exam_component_id uuid NOT NULL REFERENCES official_exam_components(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  adaptive_mode text NOT NULL,
  stage_count integer CHECK (stage_count >= 1),
  difficulty_scale_code text,
  minimum_difficulty numeric(5,2),
  maximum_difficulty numeric(5,2) CHECK (maximum_difficulty >= minimum_difficulty),
  entry_difficulty numeric(5,2),
  routing_strategy text,
  termination_strategy text,
  review_policy text,
  timing_policy_json jsonb,
  routing_rules_json jsonb,
  score_impact_json jsonb,
  selection_strategy_identifier text,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE exam_delivery_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  delivery_mode text NOT NULL,
  is_adaptive boolean NOT NULL DEFAULT false,
  is_remote_proctored boolean NOT NULL DEFAULT false,
  is_test_center boolean NOT NULL DEFAULT false,
  is_paper_based boolean NOT NULL DEFAULT false,
  is_computer_based boolean NOT NULL DEFAULT false,
  allows_calculator boolean NOT NULL DEFAULT false,
  calculator_policy text,
  allows_breaks boolean NOT NULL DEFAULT false,
  break_policy_json jsonb,
  identification_requirements_json jsonb,
  accessibility_options_json jsonb,
  availability_rules_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE exam_regional_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  country_code text,
  region_code text,
  jurisdiction text,
  board_variant text,
  language_code text DEFAULT 'en',
  timezone text,
  currency_code text,
  registration_url text,
  effective_from timestamptz,
  effective_to timestamptz,
  configuration_json jsonb,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE exam_board_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  official_exam_structure_id uuid REFERENCES official_exam_structures(id) ON DELETE CASCADE,
  official_exam_component_id uuid REFERENCES official_exam_components(id) ON DELETE CASCADE,
  metadata_namespace text NOT NULL,
  metadata_key text NOT NULL,
  metadata_value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata_schema_version text,
  source_reference text,
  effective_from timestamptz,
  effective_to timestamptz,
  is_public boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE clasptek_product_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_product_id uuid NOT NULL REFERENCES exam_products(id) ON DELETE CASCADE,
  exam_product_version_id uuid NOT NULL REFERENCES exam_product_versions(id) ON DELETE CASCADE,
  metadata_namespace text NOT NULL,
  metadata_key text NOT NULL,
  metadata_value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata_schema_version text,
  business_owner text,
  is_public boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- RESOLVE CIRCULAR REFERENCES & MAPPING FOREIGN KEYS AT THE END

-- Link products current version constraint
ALTER TABLE exam_products ADD CONSTRAINT fk_exam_product_current_version FOREIGN KEY (current_version_id) REFERENCES exam_product_versions(id) ON DELETE SET NULL;

-- Link skill frameworks current version constraint
ALTER TABLE skill_frameworks ADD CONSTRAINT fk_skill_framework_current_version FOREIGN KEY (current_version_id) REFERENCES skill_framework_versions(id) ON DELETE SET NULL;

-- Link skills current revision constraint
ALTER TABLE skills ADD CONSTRAINT fk_skill_current_revision FOREIGN KEY (current_revision_id) REFERENCES skill_revisions(id) ON DELETE SET NULL;
