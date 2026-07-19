-- Migration: 00802_ai_evaluation_rls
-- Description: Row-Level Security policies for AI Evaluation & Scoring Domain

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_audit ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- ADMIN: Full access to all tables
-- ─────────────────────────────────────────────

CREATE POLICY admin_all_ai_models            ON ai_models            FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_model_versions       ON model_versions        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_profiles        ON evaluation_profiles   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_prompt_templates     ON prompt_templates      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_prompt_versions      ON prompt_versions       FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_snapshots       ON evaluation_snapshots  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_jobs            ON evaluation_jobs       FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_prompt_executions    ON prompt_executions     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_results         ON evaluation_results    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_rubric_scores        ON rubric_scores         FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_feedback_sections    ON feedback_sections     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_evidence_refs        ON evidence_references   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_recs            ON evaluation_recommendations FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_calibration          ON calibration_results   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_human_reviews        ON human_reviews         FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_review_comments      ON review_comments       FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_metrics         ON evaluation_metrics    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_eval_audit           ON evaluation_audit      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────
-- REVIEWER: Access to assigned reviews and underlying results
-- ─────────────────────────────────────────────

CREATE POLICY reviewer_read_human_reviews ON human_reviews
  FOR SELECT USING (
    reviewer_id = (auth.jwt() ->> 'sub')::UUID
    OR auth.jwt() ->> 'role' = 'reviewer'
  );

CREATE POLICY reviewer_update_human_reviews ON human_reviews
  FOR UPDATE USING (
    reviewer_id = (auth.jwt() ->> 'sub')::UUID
    OR auth.jwt() ->> 'role' = 'reviewer'
  );

CREATE POLICY reviewer_insert_review_comments ON review_comments
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('reviewer', 'admin')
  );

CREATE POLICY reviewer_read_review_comments ON review_comments
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('reviewer', 'admin')
  );

-- Reviewers can read evaluation results for their assigned reviews
CREATE POLICY reviewer_read_eval_results ON evaluation_results
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('reviewer', 'admin')
    OR is_published = TRUE
  );

CREATE POLICY reviewer_read_rubric_scores ON rubric_scores
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('reviewer', 'admin')
  );

-- ─────────────────────────────────────────────
-- STUDENT: Read own published evaluation results
-- ─────────────────────────────────────────────

CREATE POLICY student_read_own_eval_results ON evaluation_results
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
    AND is_published = TRUE
  );

CREATE POLICY student_read_own_feedback ON feedback_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evaluation_results er
      WHERE er.id = feedback_sections.result_id
        AND er.student_id = (auth.jwt() ->> 'sub')::UUID
        AND er.is_published = TRUE
    )
  );

CREATE POLICY student_read_own_rubric_scores ON rubric_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evaluation_results er
      WHERE er.id = rubric_scores.result_id
        AND er.student_id = (auth.jwt() ->> 'sub')::UUID
        AND er.is_published = TRUE
    )
  );

CREATE POLICY student_read_own_evidence ON evidence_references
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evaluation_results er
      WHERE er.id = evidence_references.result_id
        AND er.student_id = (auth.jwt() ->> 'sub')::UUID
        AND er.is_published = TRUE
    )
  );

CREATE POLICY student_read_own_recommendations ON evaluation_recommendations
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

-- ─────────────────────────────────────────────
-- PUBLIC READ: AI models and evaluation profiles (config reference)
-- ─────────────────────────────────────────────

CREATE POLICY public_read_ai_models ON ai_models
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY public_read_eval_profiles ON evaluation_profiles
  FOR SELECT USING (is_active = TRUE);
