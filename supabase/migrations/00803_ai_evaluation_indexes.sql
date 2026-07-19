-- Migration: 00803_ai_evaluation_indexes
-- Description: Performance indexes for AI Evaluation & Scoring Domain

-- evaluation_jobs
CREATE INDEX idx_eval_jobs_student       ON evaluation_jobs(student_id);
CREATE INDEX idx_eval_jobs_submission    ON evaluation_jobs(submission_id);
CREATE INDEX idx_eval_jobs_status        ON evaluation_jobs(status);
CREATE INDEX idx_eval_jobs_snapshot      ON evaluation_jobs(snapshot_id);
CREATE INDEX idx_eval_jobs_queued_at     ON evaluation_jobs(queued_at);
CREATE INDEX idx_eval_jobs_priority      ON evaluation_jobs(priority, queued_at) WHERE status = 'QUEUED';

-- evaluation_snapshots
CREATE INDEX idx_eval_snapshots_student     ON evaluation_snapshots(student_id);
CREATE INDEX idx_eval_snapshots_submission  ON evaluation_snapshots(submission_id);
CREATE INDEX idx_eval_snapshots_session     ON evaluation_snapshots(session_id);

-- evaluation_results
CREATE INDEX idx_eval_results_student    ON evaluation_results(student_id);
CREATE INDEX idx_eval_results_submission ON evaluation_results(submission_id);
CREATE INDEX idx_eval_results_published  ON evaluation_results(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_eval_results_job        ON evaluation_results(job_id);

-- rubric_scores
CREATE INDEX idx_rubric_scores_result    ON rubric_scores(result_id);
CREATE INDEX idx_rubric_scores_criterion ON rubric_scores(criterion_code);

-- feedback_sections
CREATE INDEX idx_feedback_result         ON feedback_sections(result_id);

-- evidence_references
CREATE INDEX idx_evidence_result         ON evidence_references(result_id);

-- evaluation_recommendations
CREATE INDEX idx_eval_recs_student       ON evaluation_recommendations(student_id);
CREATE INDEX idx_eval_recs_result        ON evaluation_recommendations(result_id);
CREATE INDEX idx_eval_recs_competency    ON evaluation_recommendations(target_competency_code);

-- human_reviews
CREATE INDEX idx_human_reviews_reviewer  ON human_reviews(reviewer_id);
CREATE INDEX idx_human_reviews_job       ON human_reviews(job_id);
CREATE INDEX idx_human_reviews_status    ON human_reviews(status);

-- prompt_executions
CREATE INDEX idx_prompt_exec_job         ON prompt_executions(job_id);
CREATE INDEX idx_prompt_exec_model       ON prompt_executions(model_version_id);
CREATE INDEX idx_prompt_exec_status      ON prompt_executions(status);

-- calibration_results
CREATE INDEX idx_calibration_result      ON calibration_results(result_id);

-- evaluation_metrics
CREATE INDEX idx_eval_metrics_job        ON evaluation_metrics(job_id);

-- evaluation_audit
CREATE INDEX idx_eval_audit_job          ON evaluation_audit(job_id);
CREATE INDEX idx_eval_audit_occurred     ON evaluation_audit(occurred_at);
CREATE INDEX idx_eval_audit_event        ON evaluation_audit(event_name);
