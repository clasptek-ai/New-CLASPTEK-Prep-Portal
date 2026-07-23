-- Migration: 01201_diagnostic_indexes.sql
-- Description: Indexes for Diagnostic Bounded Context Performance

CREATE INDEX IF NOT EXISTS idx_dc_exam_product ON diagnostic_catalogs(exam_product_id);
CREATE INDEX IF NOT EXISTS idx_dc_tenant ON diagnostic_catalogs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_af_catalog ON assessment_forms(catalog_id);
CREATE INDEX IF NOT EXISTS idx_af_tenant ON assessment_forms(tenant_id);

CREATE INDEX IF NOT EXISTS idx_da_student ON diagnostic_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_da_catalog ON diagnostic_attempts(catalog_id);
CREATE INDEX IF NOT EXISTS idx_da_tenant ON diagnostic_attempts(tenant_id);

CREATE INDEX IF NOT EXISTS idx_dr_attempt ON diagnostic_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_dr_question ON diagnostic_responses(question_id);

CREATE INDEX IF NOT EXISTS idx_pr_attempt ON placement_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_pr_student ON placement_results(student_id);
CREATE INDEX IF NOT EXISTS idx_pr_tenant ON placement_results(tenant_id);

CREATE INDEX IF NOT EXISTS idx_ssp_student ON student_skill_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_ssp_skill ON student_skill_profiles(skill_code);

CREATE INDEX IF NOT EXISTS idx_drecom_placement ON diagnostic_recommendations(placement_result_id);
CREATE INDEX IF NOT EXISTS idx_drecom_student ON diagnostic_recommendations(student_id);

CREATE INDEX IF NOT EXISTS idx_el_student ON exposure_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_el_question ON exposure_ledger(question_id);

CREATE INDEX IF NOT EXISTS idx_sa_attempt ON selection_audits(attempt_id);
CREATE INDEX IF NOT EXISTS idx_sa_question ON selection_audits(question_id);
