-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 01002_learning_coach_rls.sql
-- Domain:    AI Learning Coach
-- Purpose:   Row-Level Security for all learning coach tables.
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all coach tables
ALTER TABLE learning_coaches              ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_brains                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_memory                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_plans                ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_study_plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_plans                ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_insights         ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_trackers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_analytics               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_journals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_insights                ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_recommendations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_dashboard_projections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_prompt_catalogue        ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────
-- learning_coaches: students see only their own coach
-- ─────────────────────────────────────────────────────────────────
CREATE POLICY "learning_coaches_student_read"
  ON learning_coaches FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "learning_coaches_student_write"
  ON learning_coaches FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "learning_coaches_student_update"
  ON learning_coaches FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "learning_coaches_admin_all"
  ON learning_coaches FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'instructor'));

-- ─────────────────────────────────────────────────────────────────
-- Coach brain, memory, profiles — access through coach ownership
-- ─────────────────────────────────────────────────────────────────
CREATE POLICY "coach_brains_student_read"
  ON coach_brains FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_brains_service_write"
  ON coach_brains FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin'));

CREATE POLICY "coach_memory_student_read"
  ON coach_memory FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_memory_service_write"
  ON coach_memory FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin'));

CREATE POLICY "motivation_profiles_student_read"
  ON motivation_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "motivation_profiles_service_write"
  ON motivation_profiles FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin'));

-- ─────────────────────────────────────────────────────────────────
-- Sessions, Plans, Goals — student access
-- ─────────────────────────────────────────────────────────────────
CREATE POLICY "coaching_sessions_student_all"
  ON coaching_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coaching_plans_student_all"
  ON coaching_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "daily_study_plans_student_all"
  ON daily_study_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "study_plan_tasks_student_all"
  ON study_plan_tasks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM daily_study_plans dsp
    JOIN learning_coaches lc ON lc.id = dsp.coach_id
    WHERE dsp.id = daily_plan_id AND lc.student_id = auth.uid()
  ));

CREATE POLICY "revision_plans_student_all"
  ON revision_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "study_goals_student_all"
  ON study_goals FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────
-- Conversations — private per student
-- ─────────────────────────────────────────────────────────────────
CREATE POLICY "coach_conversations_student_all"
  ON coach_conversations FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "conversation_messages_student_all"
  ON conversation_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM coach_conversations cc
    JOIN learning_coaches lc ON lc.id = cc.coach_id
    WHERE cc.id = conversation_id AND lc.student_id = auth.uid()
  ));

CREATE POLICY "conversation_summaries_student_all"
  ON conversation_summaries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM coach_conversations cc
    JOIN learning_coaches lc ON lc.id = cc.coach_id
    WHERE cc.id = conversation_id AND lc.student_id = auth.uid()
  ));

CREATE POLICY "conversation_insights_student_read"
  ON conversation_insights FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────
-- Habits, Reflections, Insights, Recommendations, Notifications
-- ─────────────────────────────────────────────────────────────────
CREATE POLICY "habit_trackers_student_all"
  ON habit_trackers FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "habit_events_student_all"
  ON habit_events FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "habit_analytics_student_read"
  ON habit_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "habit_analytics_service_write"
  ON habit_analytics FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin'));

CREATE POLICY "reflection_journals_student_all"
  ON reflection_journals FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_insights_student_read"
  ON coach_insights FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_insights_service_write"
  ON coach_insights FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin', 'instructor'));

CREATE POLICY "coach_recommendations_student_all"
  ON coach_recommendations FOR ALL
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_notifications_student_read"
  ON coach_notifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_notifications_service_write"
  ON coach_notifications FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin'));

CREATE POLICY "coach_dashboard_student_read"
  ON coach_dashboard_projections FOR SELECT
  USING (EXISTS (SELECT 1 FROM learning_coaches lc WHERE lc.id = coach_id AND lc.student_id = auth.uid()));

CREATE POLICY "coach_dashboard_service_write"
  ON coach_dashboard_projections FOR ALL
  USING (auth.jwt() ->> 'role' IN ('service', 'admin'));

-- Prompt catalogue is read-only for all authenticated users
CREATE POLICY "coach_prompt_catalogue_read"
  ON coach_prompt_catalogue FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "coach_prompt_catalogue_admin_write"
  ON coach_prompt_catalogue FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin'));
