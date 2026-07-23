# Sprint 2.8 — Database Manifest

## AI Evaluation & Scoring Domain

**Sprint:** 2.8
**Status:** RELEASED
**Date:** 2026-07-16

---

## Migration Files

| File                              | Description                                | Status  |
| --------------------------------- | ------------------------------------------ | ------- |
| `00800_ai_evaluation.sql`         | Core schema — all 19 tables                | APPLIED |
| `00801_ai_evaluation_seed.sql`    | Seed data — providers, profiles, templates | APPLIED |
| `00802_ai_evaluation_rls.sql`     | Row-Level Security policies                | APPLIED |
| `00803_ai_evaluation_indexes.sql` | Performance indexes                        | APPLIED |

---

## Tables (19)

| Table                        | Purpose                                             | Rows at Init |
| ---------------------------- | --------------------------------------------------- | ------------ |
| `ai_models`                  | AI provider model registry                          | 5 (seeded)   |
| `model_versions`             | Versioned model snapshots                           | 5 (seeded)   |
| `evaluation_profiles`        | Exam-specific evaluation config                     | 5 (seeded)   |
| `prompt_templates`           | Prompt template registry                            | 6 (seeded)   |
| `prompt_versions`            | Versioned prompt content with SHA-256 hash          | 6 (seeded)   |
| `evaluation_snapshots`       | Immutable at-evaluation-time captures               | 0            |
| `evaluation_jobs`            | Evaluation lifecycle state machine                  | 0            |
| `prompt_executions`          | Per-job AI provider audit trail                     | 0            |
| `evaluation_results`         | Scored outcomes                                     | 0            |
| `rubric_scores`              | Per-criterion scores                                | 0            |
| `feedback_sections`          | Structured feedback (strengths, improvements, etc.) | 0            |
| `evidence_references`        | Text evidence with character offsets                | 0            |
| `evaluation_recommendations` | Post-evaluation learning recommendations            | 0            |
| `calibration_results`        | Expected vs observed score drift tracking           | 0            |
| `human_reviews`              | 6-state human review lifecycle                      | 0            |
| `review_comments`            | Reviewer comments and override decisions            | 0            |
| `evaluation_metrics`         | AI latency, token usage, confidence, override rate  | 0            |
| `evaluation_audit`           | Immutable domain event audit trail                  | 0            |

---

## RLS Policies (per role)

| Role       | Read                                                                                                                          | Write                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `admin`    | All tables                                                                                                                    | All tables                         |
| `reviewer` | `human_reviews` (assigned), `evaluation_results` (all), `rubric_scores`                                                       | `human_reviews`, `review_comments` |
| `student`  | Own published `evaluation_results`, `feedback_sections`, `rubric_scores`, `evidence_references`, `evaluation_recommendations` | —                                  |
| `public`   | Active `ai_models`, active `evaluation_profiles`                                                                              | —                                  |

---

## Key Indexes

| Table                | Indexed Columns                                                                        | Purpose                         |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| `evaluation_jobs`    | `student_id`, `submission_id`, `status`, `(priority, queued_at) WHERE status='QUEUED'` | Student dashboard, queue worker |
| `evaluation_results` | `student_id`, `submission_id`, `job_id`, `is_published`                                | Result lookups                  |
| `human_reviews`      | `reviewer_id`, `job_id`, `status`                                                      | Reviewer queue                  |
| `prompt_executions`  | `job_id`, `model_version_id`, `status`                                                 | Prompt audit queries            |
| `evaluation_audit`   | `job_id`, `occurred_at`, `event_name`                                                  | Audit trail search              |
