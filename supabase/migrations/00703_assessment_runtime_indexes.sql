-- Migration: 00703_assessment_runtime_indexes
-- Description: Indexes for Assessment Runtime

CREATE INDEX idx_as_sessions_student ON assessment_sessions(student_id);
CREATE INDEX idx_as_sessions_instance ON assessment_sessions(instance_id);

CREATE INDEX idx_answers_sheet ON student_answers(sheet_id);
CREATE INDEX idx_answers_sheet_qv ON student_answers(sheet_id, question_version_id);

CREATE INDEX idx_revisions_answer ON answer_revisions(answer_id);

CREATE INDEX idx_checkpoints_session_ver ON runtime_checkpoints(session_id, checkpoint_version);

CREATE INDEX idx_nav_session ON navigation_history(session_id);

CREATE INDEX idx_incidents_session ON security_incidents(session_id);

CREATE INDEX idx_heartbeats_session ON runtime_heartbeats(session_id);

-- BRIN indexes for log scan compression
CREATE INDEX idx_brin_heartbeats_recorded ON runtime_heartbeats USING BRIN(recorded_at);
CREATE INDEX idx_brin_nav_entered ON navigation_history USING BRIN(entered_at);
