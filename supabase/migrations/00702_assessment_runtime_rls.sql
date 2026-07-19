-- Migration: 00702_assessment_runtime_rls
-- Description: RLS policies for Assessment Runtime

ALTER TABLE assessment_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_instances ON assessment_instances
  FOR SELECT TO authenticated USING (true);

ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_sessions ON assessment_sessions
  FOR ALL TO authenticated USING (student_id = auth.uid());

ALTER TABLE answer_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_answer_sheets ON answer_sheets
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_answers ON student_answers
  FOR ALL TO authenticated USING (
    sheet_id IN (SELECT id FROM answer_sheets WHERE session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid()))
  );

ALTER TABLE answer_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_revisions ON answer_revisions
  FOR ALL TO authenticated USING (
    answer_id IN (SELECT id FROM student_answers WHERE sheet_id IN (SELECT id FROM answer_sheets WHERE session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())))
  );

ALTER TABLE runtime_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_checkpoints ON runtime_checkpoints
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE session_timers ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_timers ON session_timers
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE navigation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_nav_history ON navigation_history
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE submission_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_submissions ON submission_records
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_incidents ON security_incidents
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE runtime_heartbeats ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_heartbeats ON runtime_heartbeats
  FOR ALL TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE student_id = auth.uid())
  );

ALTER TABLE runtime_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_all_stats ON runtime_statistics
  FOR ALL TO authenticated USING (student_id = auth.uid());
