-- =============================================================
-- Sprint 2.8 Addendum — AI Quality Performance Indexes
-- Migration: 00822_ai_quality_indexes.sql
-- =============================================================

-- ─── prompt_experiments indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prompt_experiments_tenant
  ON prompt_experiments (tenant_id);

CREATE INDEX IF NOT EXISTS idx_prompt_experiments_status
  ON prompt_experiments (status);

CREATE INDEX IF NOT EXISTS idx_prompt_experiments_template
  ON prompt_experiments (prompt_template_id);

CREATE INDEX IF NOT EXISTS idx_prompt_experiments_baseline
  ON prompt_experiments (baseline_version_id);

CREATE INDEX IF NOT EXISTS idx_prompt_experiments_candidate
  ON prompt_experiments (candidate_version_id);

CREATE INDEX IF NOT EXISTS idx_prompt_experiments_trigger
  ON prompt_experiments (trigger_reason);

CREATE INDEX IF NOT EXISTS idx_prompt_experiments_created
  ON prompt_experiments (created_at DESC);

-- ─── prompt_comparisons indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prompt_comparisons_experiment
  ON prompt_comparisons (experiment_id);

CREATE INDEX IF NOT EXISTS idx_prompt_comparisons_tenant
  ON prompt_comparisons (tenant_id);

CREATE INDEX IF NOT EXISTS idx_prompt_comparisons_submission
  ON prompt_comparisons (submission_id);

CREATE INDEX IF NOT EXISTS idx_prompt_comparisons_question_type
  ON prompt_comparisons (question_type);

CREATE INDEX IF NOT EXISTS idx_prompt_comparisons_evaluated_at
  ON prompt_comparisons (evaluated_at DESC);

-- ─── prompt_performance_metrics indexes ──────────────────────
CREATE INDEX IF NOT EXISTS idx_prompt_perf_experiment
  ON prompt_performance_metrics (experiment_id);

CREATE INDEX IF NOT EXISTS idx_prompt_perf_tenant
  ON prompt_performance_metrics (tenant_id);

CREATE INDEX IF NOT EXISTS idx_prompt_perf_version
  ON prompt_performance_metrics (prompt_version_id);

CREATE INDEX IF NOT EXISTS idx_prompt_perf_computed
  ON prompt_performance_metrics (computed_at DESC);

-- ─── benchmark_datasets indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_benchmark_datasets_tenant
  ON benchmark_datasets (tenant_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_datasets_status
  ON benchmark_datasets (status);

CREATE INDEX IF NOT EXISTS idx_benchmark_datasets_question_type
  ON benchmark_datasets (question_type);

CREATE INDEX IF NOT EXISTS idx_benchmark_datasets_is_locked
  ON benchmark_datasets (is_locked);

CREATE INDEX IF NOT EXISTS idx_benchmark_datasets_created
  ON benchmark_datasets (created_at DESC);

-- ─── benchmark_dataset_items indexes ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_benchmark_dataset_items_dataset
  ON benchmark_dataset_items (dataset_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_dataset_items_tenant
  ON benchmark_dataset_items (tenant_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_benchmark_dataset_items_unique_idx
  ON benchmark_dataset_items (dataset_id, item_index);

-- ─── benchmark_runs indexes ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_tenant
  ON benchmark_runs (tenant_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_dataset
  ON benchmark_runs (dataset_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_experiment
  ON benchmark_runs (experiment_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_status
  ON benchmark_runs (status);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_trigger_type
  ON benchmark_runs (trigger_type);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_created
  ON benchmark_runs (created_at DESC);

-- ─── benchmark_results indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_benchmark_results_run
  ON benchmark_results (run_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_results_tenant
  ON benchmark_results (tenant_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_results_dataset_item
  ON benchmark_results (dataset_item_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_results_evaluated
  ON benchmark_results (evaluated_at DESC);

-- ─── benchmark_regressions indexes ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_run
  ON benchmark_regressions (run_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_baseline_run
  ON benchmark_regressions (baseline_run_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_tenant
  ON benchmark_regressions (tenant_id);

CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_type
  ON benchmark_regressions (regression_type);

CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_severity
  ON benchmark_regressions (severity);

CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_resolved
  ON benchmark_regressions (is_resolved);

CREATE INDEX IF NOT EXISTS idx_benchmark_regressions_detected
  ON benchmark_regressions (detected_at DESC);

-- ─── deployment_decisions indexes ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deployment_decisions_run
  ON deployment_decisions (run_id);

CREATE INDEX IF NOT EXISTS idx_deployment_decisions_experiment
  ON deployment_decisions (experiment_id);

CREATE INDEX IF NOT EXISTS idx_deployment_decisions_tenant
  ON deployment_decisions (tenant_id);

CREATE INDEX IF NOT EXISTS idx_deployment_decisions_verdict
  ON deployment_decisions (verdict);

CREATE INDEX IF NOT EXISTS idx_deployment_decisions_decided
  ON deployment_decisions (decided_at DESC);
