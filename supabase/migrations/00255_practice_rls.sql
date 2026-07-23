-- Migration: 00255_practice_rls.sql
-- Description: Row-Level Security policies for practice delivery tables

ALTER TABLE practice_delivery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_answers_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_wrong_answer_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student practice session access" ON practice_delivery_sessions
    FOR ALL USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Student practice results access" ON practice_results
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPER_ADMIN'));
