-- Migration: 00712_mock_examination_indexes
-- Description: Performance indexes for Sprint 2.7 Mock Examination Engine tables

-- mock_blueprints
CREATE INDEX IF NOT EXISTS idx_mb_status ON mock_blueprints(status);
CREATE INDEX IF NOT EXISTS idx_mb_exam ON mock_blueprints(exam_code);

-- mock_templates
CREATE INDEX IF NOT EXISTS idx_mt_blueprint ON mock_templates(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_mt_status ON mock_templates(status);

-- mock_sessions
CREATE INDEX IF NOT EXISTS idx_ms_student ON mock_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_ms_template ON mock_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_ms_status ON mock_sessions(status);

-- mock_attempts
CREATE INDEX IF NOT EXISTS idx_ma_session ON mock_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_ma_student ON mock_attempts(student_id);

-- mock_attempt_answers
CREATE INDEX IF NOT EXISTS idx_maa_attempt ON mock_attempt_answers(attempt_id);

-- mock_results
CREATE INDEX IF NOT EXISTS idx_mr_session ON mock_results(session_id);
CREATE INDEX IF NOT EXISTS idx_mr_student ON mock_results(student_id);
CREATE INDEX IF NOT EXISTS idx_mr_status ON mock_results(status);

-- mock_reports
CREATE INDEX IF NOT EXISTS idx_mrep_result ON mock_reports(result_id);
CREATE INDEX IF NOT EXISTS idx_mrep_student ON mock_reports(student_id);

-- mock_readiness
CREATE INDEX IF NOT EXISTS idx_mread_student ON mock_readiness(student_id);

-- mock_statistics
CREATE INDEX IF NOT EXISTS idx_mstat_student ON mock_statistics(student_id);
