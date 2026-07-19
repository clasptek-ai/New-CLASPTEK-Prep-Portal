-- Clasptek Legacy Database Schema Backup

CREATE TABLE public.achievement_definitions (
  id uuid NOT NULL,
  code character varying(100) NOT NULL,
  name character varying(200) NOT NULL,
  description text NULL,
  icon_key character varying(200) NULL,
  unlock_criteria jsonb NULL,
  achievement_type character varying(100) NOT NULL,
  status character varying(50) NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.achievements (
  id uuid NOT NULL,
  journey_id uuid NULL,
  definition_id uuid NULL,
  achievement_type character varying(100) NOT NULL,
  unlocked_at timestamp with time zone NOT NULL,
  payload jsonb NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.adaptive_exam_profiles (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  official_exam_component_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  adaptive_mode text NOT NULL,
  stage_count integer NULL,
  difficulty_scale_code text NULL,
  minimum_difficulty numeric NULL,
  maximum_difficulty numeric NULL,
  entry_difficulty numeric NULL,
  routing_strategy text NULL,
  termination_strategy text NULL,
  review_policy text NULL,
  timing_policy_json jsonb NULL,
  routing_rules_json jsonb NULL,
  score_impact_json jsonb NULL,
  selection_strategy_identifier text NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.adaptive_snapshots (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  competency_levels jsonb NOT NULL,
  difficulty_profile jsonb NOT NULL,
  weak_areas jsonb NOT NULL,
  strengths jsonb NOT NULL,
  recommendation_score numeric NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.admin_dashboard_projections (
  org_id uuid NOT NULL,
  platform_usage jsonb NOT NULL,
  dau jsonb NOT NULL,
  enrollments jsonb NOT NULL,
  completion_stats jsonb NOT NULL,
  ai_usage jsonb NOT NULL,
  prediction_accuracy jsonb NOT NULL,
  infrastructure jsonb NOT NULL,
  revenue jsonb NOT NULL,
  growth_trends jsonb NOT NULL,
  retention jsonb NOT NULL,
  last_computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.ai_models (
  id uuid NOT NULL,
  provider character varying(100) NOT NULL,
  model_code character varying(200) NOT NULL,
  display_name character varying(300) NOT NULL,
  capabilities jsonb NOT NULL,
  configuration_schema jsonb NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.analytics_jobs (
  id uuid NOT NULL,
  status character varying(50) NOT NULL,
  started_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone NULL,
  duration integer NULL,
  initiated_by character varying(100) NOT NULL,
  trigger_type character varying(50) NOT NULL,
  retry_count integer NULL,
  error_message text NULL);

CREATE TABLE public.analytics_sources (
  id uuid NOT NULL,
  source_domain character varying(100) NOT NULL,
  metric_code character varying(100) NULL,
  last_sync_at timestamp with time zone NULL);

CREATE TABLE public.analytics_validations (
  id uuid NOT NULL,
  run_date date NOT NULL,
  validation_type character varying(100) NOT NULL,
  details jsonb NOT NULL,
  status character varying(50) NOT NULL,
  checked_at timestamp with time zone NULL);

CREATE TABLE public.answer_options (
  id uuid NOT NULL,
  question_version_id uuid NULL,
  code character varying(50) NOT NULL,
  text_content text NOT NULL,
  is_correct boolean NOT NULL,
  display_order integer NOT NULL);

CREATE TABLE public.answer_revisions (
  id uuid NOT NULL,
  answer_id uuid NULL,
  payload jsonb NULL,
  state character varying(50) NOT NULL,
  revision_number integer NOT NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.answer_sheets (
  id uuid NOT NULL,
  session_id uuid NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.assessment_blueprint_items (
  id uuid NOT NULL,
  assessment_blueprint_id uuid NOT NULL,
  assessment_item_type_id uuid NOT NULL,
  difficulty_level_id uuid NULL,
  cognitive_level_id uuid NULL,
  evidence_type_id uuid NULL,
  skill_group_id uuid NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  minimum_item_count integer NULL,
  maximum_item_count integer NULL,
  target_item_count integer NULL,
  weight_percentage numeric NULL,
  time_budget_minutes integer NULL,
  is_required boolean NOT NULL,
  adaptive_stage_code text NULL,
  selection_policy text NULL,
  configuration_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.assessment_blueprint_skill_mappings (
  id uuid NOT NULL,
  assessment_blueprint_item_id uuid NOT NULL,
  skill_revision_id uuid NOT NULL,
  skill_level_id uuid NULL,
  mapping_type text NOT NULL,
  importance_weight numeric NULL,
  is_primary boolean NOT NULL,
  minimum_evidence_count integer NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.assessment_blueprints (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  official_exam_component_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  blueprint_version text NULL,
  minimum_total_items integer NULL,
  maximum_total_items integer NULL,
  target_total_items integer NULL,
  total_weight_percentage numeric NULL,
  time_budget_minutes integer NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.assessment_instances (
  id uuid NOT NULL,
  question_sequence jsonb NOT NULL,
  timer_policy jsonb NOT NULL,
  navigation_policy jsonb NOT NULL,
  autosave_policy jsonb NOT NULL,
  metadata jsonb NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.assessment_item_types (
  id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  response_mode text NULL,
  scoring_mode text NULL,
  supports_partial_credit boolean NOT NULL,
  requires_stimulus boolean NOT NULL,
  requires_media boolean NOT NULL,
  allows_multiple_responses boolean NOT NULL,
  schema_version text NULL,
  configuration_schema_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.assessment_metrics (
  cohort_id uuid NOT NULL,
  total_submissions integer NOT NULL,
  average_score numeric NOT NULL,
  pass_rate numeric NOT NULL,
  completion_rate numeric NOT NULL);

CREATE TABLE public.assessment_sessions (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  instance_id uuid NULL,
  status character varying(50) NOT NULL,
  resume_token character varying(500) NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.authentication_methods (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  method_type character varying(100) NOT NULL,
  is_enabled boolean NOT NULL,
  preferences jsonb NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.bookmarks (
  id uuid NOT NULL,
  journey_id uuid NULL,
  resource_type character varying(100) NOT NULL,
  resource_id uuid NOT NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.calibration_results (
  id uuid NOT NULL,
  result_id uuid NOT NULL,
  expected_score numeric NULL,
  observed_score numeric NOT NULL,
  calibration_error numeric NULL,
  reviewer_agreement_rate numeric NULL,
  drift_indicator character varying(50) NULL,
  calibration_notes text NULL,
  calibrated_at timestamp with time zone NOT NULL);

CREATE TABLE public.clasptek_product_metadata (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  metadata_namespace text NOT NULL,
  metadata_key text NOT NULL,
  metadata_value_json jsonb NOT NULL,
  metadata_schema_version text NULL,
  business_owner text NULL,
  is_public boolean NOT NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.coach_activity_metrics (
  coach_id uuid NOT NULL,
  total_sessions integer NOT NULL,
  total_messages integer NOT NULL,
  average_response_tokens integer NOT NULL,
  satisfaction_score numeric NULL,
  last_active_at timestamp with time zone NULL);

CREATE TABLE public.coach_brains (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  coaching_style_tone text NOT NULL,
  coaching_style_pacing text NOT NULL,
  active_engine text NOT NULL,
  llm_model_id text NULL,
  prompt_version text NOT NULL,
  last_active_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_conversations (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  session_id uuid NULL,
  topic text NULL,
  status text NOT NULL,
  message_count integer NOT NULL,
  total_tokens integer NOT NULL,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone NULL,
  archived_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_dashboard_projections (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  today_tasks jsonb NOT NULL,
  goal_summary jsonb NOT NULL,
  habit_summary jsonb NOT NULL,
  latest_motivation jsonb NOT NULL,
  critical_insights jsonb NOT NULL,
  prediction_summary jsonb NOT NULL,
  last_computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_insights (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  category text NOT NULL,
  severity text NOT NULL,
  confidence numeric NOT NULL,
  insight_text text NOT NULL,
  created_from_prediction_id uuid NULL,
  created_from_evaluation_id uuid NULL,
  resolved boolean NOT NULL,
  archived boolean NOT NULL,
  resolved_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_memory (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  preferred_study_hours jsonb NOT NULL,
  preferred_learning_style text NOT NULL,
  preferred_motivation_style text NOT NULL,
  recurring_mistakes jsonb NOT NULL,
  strongest_subjects jsonb NOT NULL,
  weakest_competencies jsonb NOT NULL,
  recurring_questions jsonb NOT NULL,
  key_milestones jsonb NOT NULL,
  notes text NULL,
  version integer NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_notifications (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  notification_type text NOT NULL,
  channel text NOT NULL,
  status text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  delivered_at timestamp with time zone NULL,
  retry_count integer NOT NULL,
  max_retries integer NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_prompt_catalogue (
  id uuid NOT NULL,
  prompt_key text NOT NULL,
  display_name text NOT NULL,
  version text NOT NULL,
  engine_type text NOT NULL,
  template text NOT NULL,
  variables jsonb NOT NULL,
  evaluation_score numeric NULL,
  ab_test_group text NULL,
  is_active boolean NOT NULL,
  usage_count integer NOT NULL,
  avg_quality_score numeric NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_prompt_evaluations (
  id uuid NOT NULL,
  prompt_id uuid NOT NULL,
  evaluator_role text NOT NULL,
  quality_score numeric NOT NULL,
  coherence_score numeric NULL,
  relevance_score numeric NULL,
  safety_score numeric NULL,
  notes text NULL,
  evaluated_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_prompt_metrics (
  id uuid NOT NULL,
  prompt_id uuid NOT NULL,
  period_date date NOT NULL,
  call_count integer NOT NULL,
  avg_latency_ms numeric NULL,
  error_count integer NOT NULL,
  avg_quality numeric NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.coach_recommendations (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  session_id uuid NULL,
  recommendation_type text NOT NULL,
  priority text NOT NULL,
  title text NOT NULL,
  description text NULL,
  resource_id uuid NULL,
  competency_code text NULL,
  status text NOT NULL,
  expires_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.coaching_plans (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  plan_type text NOT NULL,
  status text NOT NULL,
  snapshot_id uuid NULL,
  prediction_score numeric NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  focus_competencies jsonb NOT NULL,
  priority_areas jsonb NOT NULL,
  generated_by_engine text NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.coaching_sessions (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  session_type text NOT NULL,
  status text NOT NULL,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone NULL,
  duration_seconds integer NULL,
  summary text NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.cohort_analytics (
  cohort_id uuid NOT NULL,
  average_readiness numeric NOT NULL,
  risk_distribution jsonb NOT NULL,
  average_study_minutes numeric NOT NULL,
  assessment_averages jsonb NOT NULL,
  updated_at timestamp with time zone NULL);

CREATE TABLE public.competencies (
  id uuid NOT NULL,
  module_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  display_order integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.competency_progress (
  id uuid NOT NULL,
  journey_id uuid NULL,
  competency_id uuid NOT NULL,
  mastery_score numeric NULL,
  last_updated timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.competency_progress_history (
  id uuid NOT NULL,
  competency_progress_id uuid NULL,
  previous_score numeric NULL,
  new_score numeric NOT NULL,
  source character varying(100) NULL,
  actor_id uuid NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.competency_projections (
  competency_code character varying(100) NOT NULL,
  display_name character varying(255) NOT NULL,
  mastery_distribution jsonb NOT NULL,
  average_score numeric NOT NULL,
  cohort_averages jsonb NOT NULL,
  last_computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.content_blocks (
  id uuid NOT NULL,
  lesson_version_id uuid NOT NULL,
  block_type character varying(50) NOT NULL,
  text_content text NOT NULL,
  display_order integer NOT NULL);

CREATE TABLE public.conversation_insights (
  id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  category text NOT NULL,
  insight_text text NOT NULL,
  confidence numeric NOT NULL,
  resolved boolean NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.conversation_messages (
  id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  token_count integer NOT NULL,
  metadata jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.conversation_summaries (
  id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  topics_covered jsonb NOT NULL,
  key_insights jsonb NOT NULL,
  follow_up_actions jsonb NOT NULL,
  token_count integer NOT NULL,
  summarised_at timestamp with time zone NOT NULL);

CREATE TABLE public.courses (
  id uuid NOT NULL,
  programme_version_id uuid NOT NULL,
  name text NOT NULL,
  description text NULL,
  display_order integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.curricula (
  id uuid NOT NULL,
  code text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text NULL,
  status text NOT NULL,
  current_version_id uuid NULL,
  current_version_no text NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.curriculum_metadata (
  id uuid NOT NULL,
  curriculum_version_id uuid NOT NULL,
  metadata_key text NOT NULL,
  metadata_value text NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.curriculum_prerequisites (
  id uuid NOT NULL,
  curriculum_version_id uuid NOT NULL,
  source_kind text NOT NULL,
  source_id uuid NOT NULL,
  target_kind text NOT NULL,
  target_id uuid NOT NULL,
  prerequisite_type text NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.curriculum_programme_version_mappings (
  id uuid NOT NULL,
  curriculum_version_id uuid NOT NULL,
  programme_id uuid NOT NULL,
  programme_version_id uuid NOT NULL,
  display_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.curriculum_versions (
  id uuid NOT NULL,
  curriculum_id uuid NOT NULL,
  version_no text NOT NULL,
  status text NOT NULL,
  name text NOT NULL,
  description text NULL,
  effective_from timestamp with time zone NULL,
  effective_until timestamp with time zone NULL,
  superseded_by uuid NULL,
  breaking_change boolean NOT NULL,
  migration_notes text NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.daily_study_plans (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  coaching_plan_id uuid NULL,
  plan_date date NOT NULL,
  status text NOT NULL,
  total_minutes integer NOT NULL,
  completed_minutes integer NOT NULL,
  completion_rate numeric NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.diagnostic_frameworks (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  framework_type text NOT NULL,
  minimum_evidence_count integer NULL,
  confidence_threshold numeric NULL,
  fallback_learning_path_id uuid NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.diagnostic_rules (
  id uuid NOT NULL,
  diagnostic_framework_id uuid NOT NULL,
  official_exam_component_id uuid NULL,
  skill_revision_id uuid NULL,
  skill_level_id uuid NULL,
  recommended_learning_path_id uuid NULL,
  rule_type text NOT NULL,
  operator text NULL,
  minimum_value numeric NULL,
  maximum_value numeric NULL,
  weight numeric NULL,
  priority integer NOT NULL,
  minimum_evidence_count integer NULL,
  confidence_threshold numeric NULL,
  condition_json jsonb NULL,
  explanation_template text NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.evaluation_audit (
  id uuid NOT NULL,
  job_id uuid NOT NULL,
  event_name character varying(200) NOT NULL,
  previous_status character varying(100) NULL,
  next_status character varying(100) NULL,
  actor_id uuid NULL,
  payload jsonb NULL,
  occurred_at timestamp with time zone NOT NULL);

CREATE TABLE public.evaluation_jobs (
  id uuid NOT NULL,
  snapshot_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_id uuid NOT NULL,
  question_type character varying(100) NOT NULL,
  status character varying(100) NOT NULL,
  priority integer NOT NULL,
  attempts integer NOT NULL,
  max_attempts integer NOT NULL,
  profile_id uuid NULL,
  model_version_id uuid NULL,
  error_message text NULL,
  queued_at timestamp with time zone NOT NULL,
  started_at timestamp with time zone NULL,
  completed_at timestamp with time zone NULL,
  published_at timestamp with time zone NULL,
  lock_version integer NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.evaluation_metrics (
  id uuid NOT NULL,
  job_id uuid NOT NULL,
  ai_latency_ms integer NULL,
  total_tokens integer NULL,
  prompt_tokens integer NULL,
  completion_tokens integer NULL,
  confidence_score numeric NULL,
  rubric_completion_time_ms integer NULL,
  average_criterion_latency_ms integer NULL,
  reviewer_override_applied boolean NOT NULL,
  model_agreement_score numeric NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.evaluation_profiles (
  id uuid NOT NULL,
  profile_code character varying(100) NOT NULL,
  display_name character varying(300) NOT NULL,
  exam_context character varying(200) NULL,
  model_id uuid NULL,
  rubric_reference jsonb NULL,
  confidence_threshold numeric NOT NULL,
  moderation_policy character varying(100) NOT NULL,
  settings jsonb NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.evaluation_recommendations (
  id uuid NOT NULL,
  result_id uuid NOT NULL,
  student_id uuid NOT NULL,
  recommendation_type character varying(100) NOT NULL,
  priority character varying(50) NOT NULL,
  title character varying(500) NOT NULL,
  description text NULL,
  target_competency_code character varying(200) NULL,
  target_topic_code character varying(200) NULL,
  metadata jsonb NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.evaluation_results (
  id uuid NOT NULL,
  job_id uuid NOT NULL,
  snapshot_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_id uuid NOT NULL,
  question_type character varying(100) NOT NULL,
  raw_score numeric NULL,
  scaled_score numeric NULL,
  band_score character varying(50) NULL,
  max_score numeric NULL,
  score_percentage numeric NULL,
  is_correct boolean NULL,
  confidence numeric NULL,
  evaluation_notes text NULL,
  is_published boolean NOT NULL,
  is_archived boolean NOT NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  published_at timestamp with time zone NULL,
  archived_at timestamp with time zone NULL);

CREATE TABLE public.evaluation_snapshots (
  id uuid NOT NULL,
  submission_id uuid NOT NULL,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  question_snapshot jsonb NOT NULL,
  rubric_snapshot jsonb NOT NULL,
  submission_snapshot jsonb NOT NULL,
  model_version_id uuid NULL,
  prompt_version_id uuid NULL,
  evaluation_settings jsonb NOT NULL,
  profile_id uuid NULL,
  snapshotted_at timestamp with time zone NOT NULL);

CREATE TABLE public.evaluation_trends (
  id uuid NOT NULL,
  evaluator_id character varying(100) NOT NULL,
  measured_date date NOT NULL,
  agreement_rate numeric NOT NULL,
  human_override_rate numeric NOT NULL,
  total_evals integer NOT NULL);

CREATE TABLE public.evidence_references (
  id uuid NOT NULL,
  result_id uuid NOT NULL,
  criterion_code character varying(200) NULL,
  text_excerpt text NOT NULL,
  start_offset integer NULL,
  end_offset integer NULL,
  relevance_note text NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.exam_board_metadata (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  official_exam_structure_id uuid NULL,
  official_exam_component_id uuid NULL,
  metadata_namespace text NOT NULL,
  metadata_key text NOT NULL,
  metadata_value_json jsonb NOT NULL,
  metadata_schema_version text NULL,
  source_reference text NULL,
  effective_from timestamp with time zone NULL,
  effective_to timestamp with time zone NULL,
  is_public boolean NOT NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.exam_delivery_configurations (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  delivery_mode text NOT NULL,
  is_adaptive boolean NOT NULL,
  is_remote_proctored boolean NOT NULL,
  is_test_center boolean NOT NULL,
  is_paper_based boolean NOT NULL,
  is_computer_based boolean NOT NULL,
  allows_calculator boolean NOT NULL,
  calculator_policy text NULL,
  allows_breaks boolean NOT NULL,
  break_policy_json jsonb NULL,
  identification_requirements_json jsonb NULL,
  accessibility_options_json jsonb NULL,
  availability_rules_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.exam_product_versions (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  version_no text NOT NULL,
  status text NOT NULL,
  name text NOT NULL,
  description text NULL,
  official_board_name text NULL,
  official_board_code text NULL,
  official_website text NULL,
  duration_minutes integer NULL,
  validity_period_months integer NULL,
  primary_language_code text NOT NULL,
  exam_type text NULL,
  change_summary text NULL,
  effective_from timestamp with time zone NULL,
  effective_to timestamp with time zone NULL,
  reviewed_at timestamp with time zone NULL,
  reviewed_by uuid NULL,
  published_at timestamp with time zone NULL,
  published_by uuid NULL,
  retired_at timestamp with time zone NULL,
  retired_by uuid NULL,
  version_no_int integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.exam_products (
  id uuid NOT NULL,
  code text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text NULL,
  product_family text NOT NULL,
  status text NOT NULL,
  current_version_id uuid NULL,
  current_version_no text NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.exam_regional_variants (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  country_code text NULL,
  region_code text NULL,
  jurisdiction text NULL,
  board_variant text NULL,
  language_code text NULL,
  timezone text NULL,
  currency_code text NULL,
  registration_url text NULL,
  effective_from timestamp with time zone NULL,
  effective_to timestamp with time zone NULL,
  configuration_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.exam_score_scales (
  id uuid NOT NULL,
  exam_score_scheme_id uuid NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  minimum_value numeric NOT NULL,
  maximum_value numeric NOT NULL,
  ordinal_position integer NOT NULL,
  result_classification text NULL,
  description text NULL,
  equivalent_framework text NULL,
  equivalent_level text NULL,
  is_passing boolean NOT NULL,
  metadata_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.exam_score_schemes (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  official_exam_component_id uuid NULL,
  code text NOT NULL,
  name text NOT NULL,
  scheme_type text NOT NULL,
  is_overall_scheme boolean NOT NULL,
  minimum_score numeric NOT NULL,
  maximum_score numeric NOT NULL,
  score_step numeric NULL,
  passing_score numeric NULL,
  decimal_places integer NULL,
  aggregation_method text NULL,
  rounding_method text NULL,
  display_format text NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.export_jobs (
  id uuid NOT NULL,
  format character varying(20) NOT NULL,
  status character varying(50) NOT NULL,
  download_expiry timestamp with time zone NOT NULL,
  generated_by character varying(100) NOT NULL,
  download_url text NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.feedback_sections (
  id uuid NOT NULL,
  result_id uuid NOT NULL,
  section_type character varying(100) NOT NULL,
  criterion_code character varying(200) NULL,
  content text NOT NULL,
  severity character varying(50) NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.habit_analytics (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  period_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  current_streak integer NOT NULL,
  longest_streak integer NOT NULL,
  weekly_consistency numeric NOT NULL,
  monthly_consistency numeric NOT NULL,
  avg_session_minutes numeric NOT NULL,
  best_study_hour integer NULL,
  worst_study_hour integer NULL,
  study_velocity numeric NOT NULL,
  computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.habit_events (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  habit_tracker_id uuid NOT NULL,
  event_type text NOT NULL,
  occurred_at timestamp with time zone NOT NULL,
  metadata jsonb NOT NULL);

CREATE TABLE public.habit_trackers (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  habit_date date NOT NULL,
  studied boolean NOT NULL,
  study_minutes integer NOT NULL,
  session_count integer NOT NULL,
  focus_score numeric NULL,
  mood text NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.human_reviews (
  id uuid NOT NULL,
  job_id uuid NOT NULL,
  result_id uuid NULL,
  reviewer_id uuid NULL,
  status character varying(100) NOT NULL,
  escalation_reason text NULL,
  assigned_at timestamp with time zone NOT NULL,
  review_started_at timestamp with time zone NULL,
  review_completed_at timestamp with time zone NULL,
  published_at timestamp with time zone NULL,
  lock_version integer NOT NULL);

CREATE TABLE public.identities (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  email character varying(255) NOT NULL,
  provider character varying(50) NOT NULL,
  is_verified boolean NOT NULL,
  login_identifier character varying(255) NOT NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.instructor_dashboard_projections (
  cohort_id uuid NOT NULL,
  overview jsonb NOT NULL,
  risk_matrix jsonb NOT NULL,
  heatmap jsonb NOT NULL,
  completion_rates jsonb NOT NULL,
  quality_summary jsonb NOT NULL,
  predictions_dist jsonb NOT NULL,
  interventions jsonb NOT NULL,
  coach_engagement jsonb NOT NULL,
  top_performers jsonb NOT NULL,
  attention_needed jsonb NOT NULL,
  last_computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.journey_events (
  id uuid NOT NULL,
  journey_id uuid NULL,
  event_name character varying(200) NOT NULL,
  event_version integer NULL,
  payload jsonb NULL,
  actor_id uuid NULL,
  occurred_at timestamp with time zone NOT NULL);

CREATE TABLE public.journey_health (
  id uuid NOT NULL,
  journey_id uuid NULL,
  engagement_score numeric NULL,
  consistency_score numeric NULL,
  completion_velocity numeric NULL,
  inactivity_days integer NULL,
  burnout_risk character varying(50) NULL,
  recommendation_priority integer NULL,
  last_calculated_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.journey_privacy_records (
  id uuid NOT NULL,
  journey_id uuid NULL,
  consent_given boolean NULL,
  consent_given_at timestamp with time zone NULL,
  data_retention_months integer NULL,
  deletion_requested_at timestamp with time zone NULL,
  deletion_executed_at timestamp with time zone NULL,
  export_requested_at timestamp with time zone NULL,
  last_audit_access timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.journey_statistics (
  id uuid NOT NULL,
  journey_id uuid NULL,
  total_study_time_ms bigint NULL,
  average_session_duration_ms integer NULL,
  learning_velocity numeric NULL,
  competency_growth numeric NULL,
  programme_completion_rate numeric NULL,
  goal_completion_rate numeric NULL,
  engagement_score numeric NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.learning_coaches (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.learning_frameworks (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  skill_framework_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  framework_version text NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.learning_goals (
  id uuid NOT NULL,
  journey_id uuid NULL,
  programme_id uuid NULL,
  title character varying(300) NOT NULL,
  description text NULL,
  goal_priority character varying(50) NULL,
  status character varying(50) NULL,
  target_date date NULL,
  completed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.learning_milestones (
  id uuid NOT NULL,
  journey_id uuid NULL,
  programme_enrollment_id uuid NULL,
  title character varying(300) NOT NULL,
  milestone_type character varying(100) NOT NULL,
  completed boolean NULL,
  completed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.learning_objectives (
  id uuid NOT NULL,
  competency_id uuid NOT NULL,
  code text NOT NULL,
  description text NOT NULL,
  display_order integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.learning_outcomes (
  id uuid NOT NULL,
  learning_objective_id uuid NOT NULL,
  code text NOT NULL,
  description text NOT NULL,
  display_order integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.learning_path_nodes (
  id uuid NOT NULL,
  learning_path_id uuid NOT NULL,
  skill_revision_id uuid NOT NULL,
  skill_level_id uuid NULL,
  official_exam_component_id uuid NULL,
  node_type text NOT NULL,
  sequence_no integer NOT NULL,
  is_required boolean NOT NULL,
  estimated_learning_minutes integer NULL,
  entry_mastery_percentage numeric NULL,
  exit_mastery_percentage numeric NULL,
  configuration_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.learning_paths (
  id uuid NOT NULL,
  learning_framework_id uuid NOT NULL,
  parent_path_id uuid NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  path_type text NOT NULL,
  level_code text NULL,
  display_order integer NOT NULL,
  recommended_duration_hours numeric NULL,
  entry_requirement_summary text NULL,
  exit_requirement_summary text NULL,
  is_required boolean NOT NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.learning_plan_versions (
  id uuid NOT NULL,
  learning_plan_id uuid NULL,
  version_no character varying(50) NOT NULL,
  source character varying(100) NULL,
  goals jsonb NULL,
  schedule jsonb NULL,
  notes text NULL,
  is_current boolean NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.learning_plans (
  id uuid NOT NULL,
  journey_id uuid NULL,
  student_id uuid NOT NULL,
  title character varying(200) NULL,
  status character varying(50) NOT NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.learning_preferences (
  id uuid NOT NULL,
  journey_id uuid NULL,
  preference_key character varying(100) NOT NULL,
  preference_value text NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.learning_resource_versions (
  id uuid NOT NULL,
  learning_resource_id uuid NOT NULL,
  version_no character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  name character varying(255) NOT NULL,
  description text NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.learning_resources (
  id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  code character varying(50) NOT NULL,
  resource_type character varying(50) NOT NULL,
  slug character varying(255) NOT NULL,
  name character varying(255) NOT NULL,
  description text NULL,
  display_order integer NOT NULL,
  status character varying(50) NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.learning_trends (
  id uuid NOT NULL,
  category character varying(100) NOT NULL,
  trend_date date NOT NULL,
  value numeric NOT NULL,
  direction character varying(20) NOT NULL,
  metadata jsonb NULL);

CREATE TABLE public.lesson_progress (
  id uuid NOT NULL,
  journey_id uuid NULL,
  module_progress_id uuid NULL,
  lesson_id uuid NOT NULL,
  completed boolean NULL,
  completed_at timestamp with time zone NULL,
  duration_ms integer NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.lesson_versions (
  id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  version_no character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  name character varying(255) NOT NULL,
  description text NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.lessons (
  id uuid NOT NULL,
  module_id uuid NOT NULL,
  code character varying(50) NOT NULL,
  name character varying(255) NOT NULL,
  description text NULL,
  display_order integer NOT NULL,
  status character varying(50) NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.media_assets (
  id uuid NOT NULL,
  resource_version_id uuid NOT NULL,
  provider character varying(50) NOT NULL,
  bucket character varying(255) NOT NULL,
  object_key character varying(1024) NOT NULL,
  region character varying(50) NULL,
  checksum character varying(255) NULL,
  mime_type character varying(255) NOT NULL,
  size bigint NOT NULL,
  duration integer NULL,
  hash_algorithm character varying(50) NULL,
  encryption_status character varying(50) NULL,
  uploaded_at timestamp with time zone NOT NULL);

CREATE TABLE public.metric_definitions (
  id uuid NOT NULL,
  code character varying(100) NOT NULL,
  display_name character varying(255) NOT NULL,
  formula text NOT NULL,
  owner character varying(100) NOT NULL,
  refresh_frequency character varying(50) NOT NULL,
  unit character varying(50) NOT NULL,
  target character varying(100) NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL);

CREATE TABLE public.migrations_log (
  id integer NOT NULL,
  name character varying(255) NOT NULL,
  applied_at timestamp with time zone NULL);

CREATE TABLE public.model_versions (
  id uuid NOT NULL,
  model_id uuid NOT NULL,
  version_tag character varying(100) NOT NULL,
  prompt_hash character varying(64) NULL,
  configuration jsonb NULL,
  is_current boolean NOT NULL,
  deprecated_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.module_progress (
  id uuid NOT NULL,
  journey_id uuid NULL,
  programme_enrollment_id uuid NULL,
  module_id uuid NOT NULL,
  completion_percentage numeric NULL,
  status character varying(50) NULL,
  started_at timestamp with time zone NULL,
  completed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.modules (
  id uuid NOT NULL,
  subject_id uuid NOT NULL,
  name text NOT NULL,
  description text NULL,
  display_order integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.motivation_profiles (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  archetype text NOT NULL,
  risk_tolerance text NOT NULL,
  preferred_feedback text NOT NULL,
  milestone_count integer NOT NULL,
  last_milestone_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.navigation_history (
  id uuid NOT NULL,
  session_id uuid NULL,
  question_id uuid NOT NULL,
  entered_at timestamp with time zone NOT NULL,
  exited_at timestamp with time zone NULL,
  duration_ms integer NULL);

CREATE TABLE public.official_exam_components (
  id uuid NOT NULL,
  official_exam_structure_id uuid NOT NULL,
  parent_component_id uuid NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  component_type text NOT NULL,
  display_order integer NOT NULL,
  is_required boolean NOT NULL,
  is_scored boolean NOT NULL,
  is_timed boolean NOT NULL,
  duration_minutes integer NULL,
  weight_percentage numeric NULL,
  minimum_items integer NULL,
  maximum_items integer NULL,
  metadata_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.official_exam_structures (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  board_structure_version text NULL,
  description text NULL,
  effective_from timestamp with time zone NULL,
  effective_to timestamp with time zone NULL,
  source_reference text NULL,
  is_current_official_structure boolean NOT NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.outbox_events (
  id uuid NOT NULL,
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamp with time zone NOT NULL,
  processed_at timestamp with time zone NULL);

CREATE TABLE public.permission_groups (
  id uuid NOT NULL,
  name character varying(100) NOT NULL,
  description character varying(255) NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.permissions (
  id uuid NOT NULL,
  permission_group_id uuid NOT NULL,
  code character varying(100) NOT NULL,
  description character varying(255) NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.platform_metadata (
  key character varying(255) NOT NULL,
  value text NOT NULL,
  category character varying(100) NOT NULL,
  description text NULL,
  version integer NOT NULL,
  updated_at timestamp with time zone NULL);

CREATE TABLE public.platform_metrics (
  metric_date date NOT NULL,
  dau integer NOT NULL,
  mau integer NOT NULL,
  new_users integer NOT NULL,
  active_connections integer NOT NULL);

CREATE TABLE public.practice_difficulty_history (
  id uuid NOT NULL,
  session_id uuid NULL,
  previous_level character varying(50) NOT NULL,
  current_level character varying(50) NOT NULL,
  confidence numeric NOT NULL,
  promotion_reason text NULL,
  demotion_reason text NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.practice_feedback (
  id uuid NOT NULL,
  session_id uuid NULL,
  rating integer NULL,
  difficulty_perception character varying(100) NULL,
  confidence character varying(100) NULL,
  satisfaction character varying(100) NULL,
  usefulness character varying(100) NULL,
  technical_issue boolean NULL,
  recommendation_quality character varying(100) NULL,
  comment text NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.practice_history (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  session_id uuid NULL,
  competency_coverage_achieved jsonb NOT NULL,
  average_question_difficulty numeric NOT NULL,
  recommendation_acceptance_rate numeric NOT NULL,
  abandoned_sessions integer NOT NULL,
  regeneration_count integer NOT NULL,
  average_adaptation_confidence numeric NOT NULL,
  completed_at timestamp with time zone NOT NULL);

CREATE TABLE public.practice_metrics (
  cohort_id uuid NOT NULL,
  total_practice_sessions integer NOT NULL,
  average_score numeric NOT NULL,
  accuracy_rate numeric NOT NULL,
  time_spent_seconds bigint NOT NULL);

CREATE TABLE public.practice_plans (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  recommendation_id uuid NULL,
  title character varying(200) NULL,
  status character varying(50) NOT NULL,
  selection_rules jsonb NOT NULL,
  targeted_competencies jsonb NOT NULL,
  spacing_policy jsonb NOT NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.practice_recommendations (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  recommendation_rules jsonb NULL,
  recommendation_source character varying(100) NOT NULL,
  priority character varying(50) NOT NULL,
  priority_weight numeric NOT NULL,
  status character varying(50) NOT NULL,
  input_snapshot jsonb NOT NULL,
  algorithm_version character varying(50) NOT NULL,
  decision_trace jsonb NOT NULL,
  output_payload jsonb NOT NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.practice_session_questions (
  id uuid NOT NULL,
  session_id uuid NULL,
  question_version_id uuid NOT NULL,
  order_index integer NOT NULL,
  status character varying(50) NOT NULL,
  accuracy numeric NULL,
  time_spent_ms integer NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.practice_sessions (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  plan_id uuid NULL,
  status character varying(50) NOT NULL,
  started_at timestamp with time zone NULL,
  ended_at timestamp with time zone NULL,
  duration_ms integer NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.practice_statistics (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  total_sessions_completed integer NOT NULL,
  total_questions_answered integer NOT NULL,
  overall_accuracy numeric NOT NULL,
  recommendations_accepted integer NOT NULL,
  recommendations_rejected integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.practice_strategy_registry (
  strategy_code character varying(100) NOT NULL,
  display_name character varying(200) NOT NULL,
  algorithm_version character varying(50) NOT NULL,
  configuration_schema jsonb NULL,
  status character varying(50) NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.prediction_audit_logs (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  event_name character varying(255) NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamp with time zone NULL);

CREATE TABLE public.prediction_calibration (
  id uuid NOT NULL,
  model_version_id uuid NOT NULL,
  expected_score numeric NOT NULL,
  observed_score numeric NOT NULL,
  calibration_error numeric NOT NULL,
  measured_at timestamp with time zone NULL);

CREATE TABLE public.prediction_evidence (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  evidence_type character varying(100) NOT NULL,
  evidence_source_id uuid NOT NULL,
  weight numeric NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_experiments (
  id uuid NOT NULL,
  experiment_code character varying(255) NOT NULL,
  display_name character varying(255) NOT NULL,
  control_model_version_id uuid NOT NULL,
  challenger_model_version_id uuid NOT NULL,
  traffic_split_percentage integer NOT NULL,
  status character varying(50) NOT NULL,
  start_date timestamp with time zone NULL,
  end_date timestamp with time zone NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_explanations (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  contributing_factors jsonb NOT NULL,
  feature_importance jsonb NOT NULL,
  confidence_explanation text NOT NULL,
  evidence_references jsonb NOT NULL,
  created_at timestamp with time zone NULL,
  certainty_score numeric NOT NULL,
  top_influencing_competencies jsonb NOT NULL,
  strongest_risk_indicators jsonb NOT NULL,
  feature_contribution_ranking jsonb NOT NULL);

CREATE TABLE public.prediction_feature_catalogue (
  id uuid NOT NULL,
  feature_code character varying(255) NOT NULL,
  display_name character varying(255) NOT NULL,
  source_domain character varying(255) NOT NULL,
  normalization_method character varying(255) NOT NULL,
  default_weight numeric NOT NULL,
  version character varying(50) NOT NULL,
  description text NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_feature_sets (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  features jsonb NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_features (
  id uuid NOT NULL,
  feature_code character varying(255) NOT NULL,
  display_name character varying(255) NOT NULL,
  data_type character varying(50) NOT NULL,
  description text NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_history (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  overall_readiness_score numeric NOT NULL,
  recorded_at timestamp with time zone NULL);

CREATE TABLE public.prediction_inputs (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  raw_payload jsonb NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_intervention_catalogue (
  id uuid NOT NULL,
  intervention_type character varying(100) NOT NULL,
  title character varying(255) NOT NULL,
  description text NOT NULL,
  priority integer NOT NULL,
  target_resource_id uuid NULL,
  target_competency_code character varying(255) NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_interventions (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  student_id uuid NOT NULL,
  risk_level character varying(50) NOT NULL,
  risk_score numeric NOT NULL,
  trigger_reason text NOT NULL,
  status character varying(50) NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL);

CREATE TABLE public.prediction_learning_velocity_history (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  active_hours numeric NOT NULL,
  questions_answered integer NOT NULL,
  acceleration_rate numeric NOT NULL,
  stagnation_indicator boolean NOT NULL,
  recorded_at timestamp with time zone NULL);

CREATE TABLE public.prediction_lifecycle_metrics (
  id uuid NOT NULL,
  model_version_id uuid NOT NULL,
  measured_at timestamp with time zone NULL,
  generation_latency_ms numeric NOT NULL,
  prediction_acceptance_rate numeric NOT NULL,
  intervention_completion_rate numeric NOT NULL,
  intervention_effectiveness numeric NOT NULL,
  model_drift numeric NOT NULL,
  experiment_success_rate numeric NOT NULL);

CREATE TABLE public.prediction_metrics (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  latency_ms integer NOT NULL,
  evidence_count integer NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_model_versions (
  id uuid NOT NULL,
  model_id uuid NOT NULL,
  version_string character varying(50) NOT NULL,
  configuration jsonb NOT NULL,
  is_current boolean NOT NULL,
  trained_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL,
  supersedes_version_id uuid NULL,
  trained_from_dataset character varying(255) NULL,
  calibration_dataset_ref character varying(255) NULL,
  deployment_date timestamp with time zone NULL,
  retirement_date timestamp with time zone NULL);

CREATE TABLE public.prediction_models (
  id uuid NOT NULL,
  model_code character varying(255) NOT NULL,
  display_name character varying(255) NOT NULL,
  algorithm_type character varying(50) NOT NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL);

CREATE TABLE public.prediction_outcomes (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  student_id uuid NOT NULL,
  predicted_score numeric NOT NULL,
  actual_score numeric NOT NULL,
  variance numeric NOT NULL,
  calibration_delta numeric NOT NULL,
  recorded_at timestamp with time zone NULL);

CREATE TABLE public.prediction_outputs (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  raw_outputs jsonb NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_profiles (
  id uuid NOT NULL,
  profile_code character varying(255) NOT NULL,
  display_name character varying(255) NOT NULL,
  exam_context character varying(50) NOT NULL,
  confidence_rules jsonb NOT NULL,
  score_mappings jsonb NOT NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_quality_metrics (
  id uuid NOT NULL,
  model_version_id uuid NOT NULL,
  measured_at timestamp with time zone NULL,
  prediction_accuracy numeric NOT NULL,
  calibration_error numeric NOT NULL,
  intervention_success_rate numeric NOT NULL,
  false_positive_rate numeric NOT NULL,
  false_negative_rate numeric NOT NULL,
  forecast_drift numeric NOT NULL,
  model_stability numeric NOT NULL);

CREATE TABLE public.prediction_recommendations (
  id uuid NOT NULL,
  intervention_id uuid NOT NULL,
  recommendation_type character varying(100) NOT NULL,
  priority integer NOT NULL,
  title character varying(255) NOT NULL,
  description text NULL,
  target_resource_id uuid NULL,
  target_competency_code character varying(255) NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_snapshots (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  readiness_snapshot_id uuid NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_thresholds (
  id uuid NOT NULL,
  profile_id uuid NOT NULL,
  threshold_name character varying(255) NOT NULL,
  threshold_value numeric NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.prediction_trends (
  id uuid NOT NULL,
  prediction_id uuid NOT NULL,
  trend_type character varying(50) NOT NULL,
  slope numeric NOT NULL,
  explanation text NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  first_name character varying(255) NOT NULL,
  last_name character varying(255) NOT NULL,
  avatar character varying(512) NULL,
  locale character varying(10) NULL,
  time_zone character varying(50) NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.programme_versions (
  id uuid NOT NULL,
  programme_id uuid NOT NULL,
  version_no text NOT NULL,
  status text NOT NULL,
  name text NOT NULL,
  description text NULL,
  effective_from timestamp with time zone NULL,
  effective_until timestamp with time zone NULL,
  superseded_by uuid NULL,
  breaking_change boolean NOT NULL,
  migration_notes text NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.programmes (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  code text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text NULL,
  status text NOT NULL,
  current_version_id uuid NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.prompt_executions (
  id uuid NOT NULL,
  job_id uuid NOT NULL,
  prompt_version_id uuid NULL,
  model_version_id uuid NULL,
  provider character varying(100) NOT NULL,
  model_code character varying(200) NOT NULL,
  system_prompt_hash character varying(64) NOT NULL,
  user_prompt_hash character varying(64) NOT NULL,
  temperature numeric NULL,
  prompt_tokens integer NULL,
  completion_tokens integer NULL,
  total_tokens integer NULL,
  latency_ms integer NULL,
  status character varying(50) NOT NULL,
  error_message text NULL,
  executed_at timestamp with time zone NOT NULL);

CREATE TABLE public.prompt_templates (
  id uuid NOT NULL,
  template_code character varying(200) NOT NULL,
  display_name character varying(300) NOT NULL,
  question_type character varying(100) NULL,
  system_prompt text NOT NULL,
  user_prompt_template text NOT NULL,
  variables jsonb NOT NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.prompt_versions (
  id uuid NOT NULL,
  template_id uuid NOT NULL,
  version_number integer NOT NULL,
  system_prompt text NOT NULL,
  user_prompt_template text NOT NULL,
  prompt_hash character varying(64) NOT NULL,
  change_notes text NULL,
  is_current boolean NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.question_blueprint_mappings (
  id uuid NOT NULL,
  question_id uuid NULL,
  blueprint_code character varying(100) NOT NULL,
  section_code character varying(50) NOT NULL,
  question_order integer NOT NULL);

CREATE TABLE public.question_dependencies (
  id uuid NOT NULL,
  parent_question_id uuid NULL,
  child_question_id uuid NULL,
  dependency_type character varying(50) NOT NULL);

CREATE TABLE public.question_media (
  id uuid NOT NULL,
  question_version_id uuid NULL,
  provider character varying(50) NULL,
  bucket character varying(100) NULL,
  object_key text NULL,
  checksum character varying(256) NULL,
  mime_type character varying(100) NULL,
  file_size bigint NULL,
  duration_seconds integer NULL,
  transcript text NULL,
  caption text NULL,
  thumbnail_key text NULL,
  alt_text text NULL);

CREATE TABLE public.question_ownership (
  id uuid NOT NULL,
  question_id uuid NULL,
  copyright_holder character varying(255) NOT NULL,
  license character varying(100) NOT NULL,
  source text NULL,
  reuse_policy text NULL,
  expiration_date timestamp with time zone NULL);

CREATE TABLE public.question_reviews (
  id uuid NOT NULL,
  question_id uuid NULL,
  reviewer_id uuid NOT NULL,
  reviewer_role character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  comments text NULL,
  validation_report jsonb NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.question_schema_registry (
  schema_name character varying(100) NOT NULL,
  schema_version character varying(50) NOT NULL,
  validator text NULL,
  renderer character varying(100) NULL,
  migration_strategy text NULL,
  deprecated boolean NULL);

CREATE TABLE public.question_statistics (
  id uuid NOT NULL,
  question_id uuid NULL,
  times_used integer NOT NULL,
  times_answered integer NOT NULL,
  correct_rate numeric NOT NULL,
  facility_index numeric NOT NULL,
  discrimination_index numeric NOT NULL,
  guess_probability numeric NOT NULL,
  average_duration_ms integer NOT NULL,
  median_duration_ms integer NOT NULL,
  skip_rate numeric NOT NULL,
  last_used timestamp with time zone NULL);

CREATE TABLE public.question_translations (
  id uuid NOT NULL,
  question_version_id uuid NULL,
  language character varying(10) NOT NULL,
  title text NULL,
  payload jsonb NULL,
  solution text NULL,
  rubric text NULL);

CREATE TABLE public.question_versions (
  id uuid NOT NULL,
  question_id uuid NULL,
  version_no character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  title text NOT NULL,
  payload jsonb NULL,
  digital_signature text NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  lock_version integer NOT NULL);

CREATE TABLE public.question_workflow_history (
  id uuid NOT NULL,
  question_id uuid NULL,
  stage character varying(50) NOT NULL,
  actor_id uuid NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  comments text NULL,
  evidence jsonb NULL,
  digital_signature text NULL);

CREATE TABLE public.questions (
  id uuid NOT NULL,
  code character varying(100) NOT NULL,
  exam_product_id uuid NULL,
  curriculum_module_id uuid NULL,
  status character varying(50) NOT NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.readiness_criteria (
  id uuid NOT NULL,
  readiness_framework_id uuid NOT NULL,
  official_exam_component_id uuid NULL,
  skill_revision_id uuid NULL,
  skill_level_id uuid NULL,
  learning_path_id uuid NULL,
  criterion_type text NOT NULL,
  operator text NULL,
  target_value numeric NULL,
  minimum_value numeric NULL,
  maximum_value numeric NULL,
  weight numeric NULL,
  is_mandatory boolean NOT NULL,
  priority integer NOT NULL,
  evidence_window_days integer NULL,
  configuration_json jsonb NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.readiness_frameworks (
  id uuid NOT NULL,
  exam_product_id uuid NOT NULL,
  exam_product_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  target_score_scheme_id uuid NULL,
  evaluation_strategy text NULL,
  minimum_confidence numeric NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.readiness_predictions (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  model_version_id uuid NOT NULL,
  status character varying(50) NOT NULL,
  overall_readiness_score numeric NULL,
  confidence_value numeric NULL,
  confidence_interval_low numeric NULL,
  confidence_interval_high numeric NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  published_at timestamp with time zone NULL);

CREATE TABLE public.readiness_snapshots (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  learner_state jsonb NOT NULL,
  latest_evaluation_summaries jsonb NOT NULL,
  practice_statistics jsonb NOT NULL,
  study_streak jsonb NOT NULL,
  competency_mastery jsonb NOT NULL,
  forecast_window character varying(50) NOT NULL,
  model_version_id uuid NULL,
  snapshotted_at timestamp with time zone NULL);

CREATE TABLE public.reflection_journals (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  session_id uuid NULL,
  mood text NOT NULL,
  difficulty_rating integer NOT NULL,
  insights text NULL,
  what_went_well text NULL,
  what_was_difficult text NULL,
  next_session_focus text NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.report_definitions (
  id uuid NOT NULL,
  code character varying(100) NOT NULL,
  name character varying(255) NOT NULL,
  template_json jsonb NOT NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.report_executions (
  id uuid NOT NULL,
  report_definition_id uuid NULL,
  status character varying(50) NOT NULL,
  executed_at timestamp with time zone NOT NULL,
  result_url text NULL,
  error_log text NULL);

CREATE TABLE public.report_schedules (
  id uuid NOT NULL,
  report_definition_id uuid NULL,
  recipient_email character varying(255) NOT NULL,
  cron_expression character varying(100) NOT NULL,
  active boolean NULL,
  created_at timestamp with time zone NULL);

CREATE TABLE public.resource_attachments (
  id uuid NOT NULL,
  resource_version_id uuid NOT NULL,
  name character varying(255) NOT NULL,
  file_size bigint NOT NULL,
  mime_type character varying(255) NOT NULL,
  object_key character varying(1024) NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.resource_captions (
  id uuid NOT NULL,
  resource_version_id uuid NOT NULL,
  caption_text text NOT NULL,
  language character varying(50) NOT NULL);

CREATE TABLE public.resource_downloads (
  id uuid NOT NULL,
  resource_version_id uuid NOT NULL,
  url character varying(2048) NOT NULL,
  title character varying(255) NOT NULL);

CREATE TABLE public.resource_links (
  id uuid NOT NULL,
  resource_version_id uuid NOT NULL,
  url character varying(2048) NOT NULL,
  title character varying(255) NOT NULL);

CREATE TABLE public.resource_metadata (
  resource_version_id uuid NOT NULL,
  metadata_key character varying(100) NOT NULL,
  metadata_value text NOT NULL);

CREATE TABLE public.resource_tags (
  resource_version_id uuid NOT NULL,
  tag character varying(100) NOT NULL);

CREATE TABLE public.resource_transcripts (
  id uuid NOT NULL,
  resource_version_id uuid NOT NULL,
  transcript_text text NOT NULL,
  language character varying(50) NOT NULL);

CREATE TABLE public.review_comments (
  id uuid NOT NULL,
  review_id uuid NOT NULL,
  criterion_code character varying(200) NULL,
  comment_text text NOT NULL,
  decision character varying(50) NULL,
  override_score numeric NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.revision_plans (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  campaign_type text NOT NULL,
  status text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  focus_areas jsonb NOT NULL,
  exam_date date NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.risk_projections (
  student_id uuid NOT NULL,
  risk_level character varying(50) NOT NULL,
  risk_score numeric NOT NULL,
  risk_factors jsonb NOT NULL,
  recommended_action text NOT NULL,
  last_computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.role_permission_groups (
  id uuid NOT NULL,
  role_id uuid NOT NULL,
  permission_group_id uuid NOT NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.roles (
  id uuid NOT NULL,
  name character varying(100) NOT NULL,
  description character varying(255) NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.rubric_scores (
  id uuid NOT NULL,
  result_id uuid NOT NULL,
  criterion_code character varying(200) NOT NULL,
  criterion_name character varying(300) NOT NULL,
  score numeric NOT NULL,
  max_score numeric NOT NULL,
  band_descriptor character varying(200) NULL,
  justification text NULL,
  weight numeric NOT NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.rubrics (
  id uuid NOT NULL,
  question_version_id uuid NULL,
  criteria text NULL,
  max_points integer NULL,
  description text NULL);

CREATE TABLE public.runtime_checkpoints (
  id uuid NOT NULL,
  session_id uuid NULL,
  checkpoint_version integer NOT NULL,
  active_question_id uuid NULL,
  elapsed_time_ms integer NOT NULL,
  answers_snapshot jsonb NOT NULL,
  device_fingerprint jsonb NULL,
  connectivity_snapshot jsonb NULL,
  checksum character varying(256) NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.runtime_heartbeats (
  id uuid NOT NULL,
  session_id uuid NULL,
  elapsed_time_ms integer NOT NULL,
  active_question_id uuid NULL,
  browser_visibility character varying(50) NOT NULL,
  network_status character varying(50) NOT NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.runtime_statistics (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  session_id uuid NULL,
  answer_save_latencies jsonb NULL,
  checkpoint_latencies jsonb NULL,
  submission_latency_ms integer NULL,
  heartbeat_failures integer NOT NULL,
  reconnect_count integer NOT NULL,
  autosave_failures integer NOT NULL,
  security_incidents_count integer NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.security_incidents (
  id uuid NOT NULL,
  session_id uuid NULL,
  incident_type character varying(100) NOT NULL,
  payload jsonb NULL,
  recorded_at timestamp with time zone NOT NULL);

CREATE TABLE public.security_profiles (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  preferred_mfa character varying(50) NULL,
  failed_attempts integer NOT NULL,
  lock_status character varying(50) NOT NULL,
  security_preferences jsonb NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.security_sessions (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  supabase_session_id character varying(255) NULL,
  browser character varying(255) NULL,
  ip_address character varying(50) NULL,
  country character varying(100) NULL,
  device character varying(255) NULL,
  user_agent character varying(512) NULL,
  login_timestamp timestamp with time zone NOT NULL,
  revoked_by_admin boolean NOT NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.session_timers (
  id uuid NOT NULL,
  session_id uuid NULL,
  timer_type character varying(100) NOT NULL,
  limit_ms integer NULL,
  elapsed_ms integer NOT NULL,
  started_at timestamp with time zone NULL,
  paused_at timestamp with time zone NULL);

CREATE TABLE public.skill_framework_versions (
  id uuid NOT NULL,
  skill_framework_id uuid NOT NULL,
  version_no text NOT NULL,
  status text NOT NULL,
  name text NOT NULL,
  description text NULL,
  change_summary text NULL,
  effective_from timestamp with time zone NULL,
  effective_to timestamp with time zone NULL,
  published_at timestamp with time zone NULL,
  published_by uuid NULL,
  version_no_int integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.skill_frameworks (
  id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  status text NOT NULL,
  current_version_id uuid NULL,
  current_version_no text NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.skill_levels (
  id uuid NOT NULL,
  skill_framework_version_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NULL,
  ordinal_position integer NOT NULL,
  minimum_mastery_percentage numeric NULL,
  maximum_mastery_percentage numeric NULL,
  equivalent_framework text NULL,
  equivalent_level text NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.skill_relations (
  id uuid NOT NULL,
  skill_framework_version_id uuid NOT NULL,
  source_skill_revision_id uuid NOT NULL,
  target_skill_revision_id uuid NOT NULL,
  relation_type text NOT NULL,
  strength numeric NULL,
  is_mandatory boolean NOT NULL,
  rationale text NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.skill_revisions (
  id uuid NOT NULL,
  skill_id uuid NOT NULL,
  skill_framework_version_id uuid NOT NULL,
  revision_no integer NOT NULL,
  parent_skill_revision_id uuid NULL,
  name text NOT NULL,
  description text NULL,
  category text NULL,
  domain text NULL,
  is_leaf_skill boolean NOT NULL,
  assessment_capability boolean NOT NULL,
  learning_capability boolean NOT NULL,
  status text NOT NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.skills (
  id uuid NOT NULL,
  skill_framework_id uuid NOT NULL,
  code text NOT NULL,
  canonical_name text NOT NULL,
  status text NOT NULL,
  current_revision_id uuid NULL,
  version_no integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.snapshot_versions (
  id uuid NOT NULL,
  generated_at timestamp with time zone NOT NULL,
  source_domains ARRAY NOT NULL,
  schema_version character varying(50) NOT NULL,
  aggregation_version character varying(50) NOT NULL);

CREATE TABLE public.solutions (
  id uuid NOT NULL,
  question_version_id uuid NULL,
  explanation text NULL,
  incorrect_explanation text NULL,
  hint text NULL,
  reference_url text NULL,
  teaching_note text NULL);

CREATE TABLE public.student_analytics_dashboard_projections (
  student_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  readiness_score numeric NULL,
  daily_plan jsonb NULL,
  goal_completion numeric NULL,
  study_streak integer NULL,
  practice_performance jsonb NULL,
  assessment_history jsonb NULL,
  coach_summary jsonb NULL,
  prediction_trend jsonb NULL,
  weak_competencies jsonb NULL,
  recommended_actions jsonb NULL,
  last_computed_at timestamp with time zone NOT NULL);

CREATE TABLE public.student_answers (
  id uuid NOT NULL,
  sheet_id uuid NULL,
  question_id uuid NOT NULL,
  question_version_id uuid NOT NULL,
  payload jsonb NULL,
  state character varying(50) NOT NULL,
  time_spent_ms integer NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.student_dashboard_projections (
  id uuid NOT NULL,
  journey_id uuid NULL,
  student_id uuid NOT NULL,
  active_programme_id uuid NULL,
  active_programme_name character varying(300) NULL,
  overall_progress numeric NULL,
  current_goal_id uuid NULL,
  current_goal_title character varying(300) NULL,
  current_streak integer NULL,
  next_milestone_id uuid NULL,
  next_milestone_title character varying(300) NULL,
  recommendation_payload jsonb NULL,
  last_projected_at timestamp with time zone NOT NULL);

CREATE TABLE public.student_learning_journeys (
  id uuid NOT NULL,
  student_id uuid NOT NULL,
  status character varying(50) NOT NULL,
  lock_version integer NOT NULL,
  engagement_score numeric NULL,
  consistency_score numeric NULL,
  completion_velocity numeric NULL,
  inactivity_days integer NULL,
  burnout_risk character varying(50) NULL,
  recommendation_priority integer NULL,
  consent_given boolean NULL,
  data_retention_policy character varying(100) NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.student_programme_enrollments (
  id uuid NOT NULL,
  journey_id uuid NULL,
  student_id uuid NOT NULL,
  programme_id uuid NOT NULL,
  programme_version_id uuid NOT NULL,
  enrolled_at timestamp with time zone NOT NULL,
  enrollment_status character varying(50) NOT NULL,
  delivery_mode character varying(100) NULL,
  cohort_id uuid NULL,
  intake_date date NULL,
  payment_verified boolean NULL,
  instructor_id uuid NULL,
  completion_certificate_id uuid NULL,
  withdrawn_at timestamp with time zone NULL,
  withdrawal_reason text NULL,
  completed_at timestamp with time zone NULL,
  lock_version integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.study_goals (
  id uuid NOT NULL,
  coach_id uuid NOT NULL,
  goal_type text NOT NULL,
  status text NOT NULL,
  title text NOT NULL,
  description text NULL,
  target_value numeric NULL,
  current_value numeric NOT NULL,
  target_unit text NULL,
  target_competency text NULL,
  deadline date NULL,
  completed_at timestamp with time zone NULL,
  failed_at timestamp with time zone NULL,
  paused_at timestamp with time zone NULL,
  paused_reason text NULL,
  risk_detected_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.study_plan_tasks (
  id uuid NOT NULL,
  daily_plan_id uuid NOT NULL,
  task_type text NOT NULL,
  competency_code text NULL,
  resource_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  estimated_minutes integer NOT NULL,
  priority integer NOT NULL,
  status text NOT NULL,
  completed_at timestamp with time zone NULL,
  sort_order integer NOT NULL);

CREATE TABLE public.study_sessions (
  id uuid NOT NULL,
  journey_id uuid NULL,
  programme_id uuid NULL,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone NULL,
  duration_ms integer NULL,
  device_type character varying(100) NULL,
  platform character varying(100) NULL,
  ip_hash character varying(256) NULL,
  timezone character varying(100) NULL,
  interruption_count integer NULL,
  idle_time_ms integer NULL,
  completion_reason character varying(100) NULL,
  created_at timestamp with time zone NOT NULL);

CREATE TABLE public.study_streaks (
  id uuid NOT NULL,
  journey_id uuid NULL,
  current_streak integer NULL,
  longest_streak integer NULL,
  last_study_date date NULL,
  streak_started_at date NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL);

CREATE TABLE public.subjects (
  id uuid NOT NULL,
  course_id uuid NOT NULL,
  name text NOT NULL,
  description text NULL,
  display_order integer NOT NULL,
  lock_version bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  created_by uuid NULL,
  updated_at timestamp with time zone NOT NULL,
  updated_by uuid NULL,
  deleted_at timestamp with time zone NULL,
  deleted_by uuid NULL);

CREATE TABLE public.submission_records (
  id uuid NOT NULL,
  session_id uuid NULL,
  receipt_checksum character varying(256) NOT NULL,
  signature character varying(500) NOT NULL,
  server_id character varying(100) NOT NULL,
  submitted_at timestamp with time zone NOT NULL);

CREATE TABLE public.trusted_devices (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  device_fingerprint character varying(512) NOT NULL,
  trust_expires_at timestamp with time zone NOT NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.user_roles (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.users (
  id uuid NOT NULL,
  status character varying(50) NOT NULL,
  version integer NOT NULL,
  created_at timestamp with time zone NULL,
  updated_at timestamp with time zone NULL,
  archived_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL);

CREATE TABLE public.view_active_cohort_risk_summary (
  cohort_id uuid NULL,
  total_students bigint NULL,
  high_risk_count bigint NULL,
  medium_risk_count bigint NULL,
  low_risk_count bigint NULL);

CREATE TABLE public.vw_assessment_blueprints (
  blueprint_id uuid NULL,
  blueprint_code text NULL,
  blueprint_name text NULL,
  component_name text NULL,
  item_id uuid NULL,
  item_code text NULL,
  item_name text NULL,
  item_type_name text NULL,
  target_item_count integer NULL,
  weight_percentage numeric NULL);

CREATE TABLE public.vw_exam_products (
  product_id uuid NULL,
  product_code text NULL,
  product_slug text NULL,
  product_name text NULL,
  product_family text NULL,
  product_status text NULL,
  version_id uuid NULL,
  version_no text NULL,
  version_status text NULL,
  version_name text NULL,
  duration_minutes integer NULL,
  exam_type text NULL);

CREATE TABLE public.vw_learning_paths (
  path_id uuid NULL,
  learning_framework_id uuid NULL,
  path_code text NULL,
  path_name text NULL,
  path_type text NULL,
  node_id uuid NULL,
  sequence_no integer NULL,
  node_type text NULL,
  estimated_learning_minutes integer NULL,
  skill_name text NULL,
  level_name text NULL);

CREATE TABLE public.vw_skill_hierarchy (
  skill_revision_id uuid NULL,
  skill_id uuid NULL,
  skill_framework_version_id uuid NULL,
  parent_skill_revision_id uuid NULL,
  skill_name text NULL,
  category text NULL,
  domain text NULL,
  is_leaf_skill boolean NULL,
  depth integer NULL,
  path ARRAY NULL);

CREATE TABLE public.widget_definitions (
  id uuid NOT NULL,
  widget_type character varying(100) NOT NULL,
  display_name character varying(255) NOT NULL,
  default_config jsonb NOT NULL);

CREATE TABLE public.widget_instances (
  id uuid NOT NULL,
  dashboard_id uuid NOT NULL,
  widget_definition_id uuid NULL,
  title character varying(255) NOT NULL,
  layout_grid jsonb NOT NULL,
  configuration jsonb NOT NULL,
  created_at timestamp with time zone NULL
);
