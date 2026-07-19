-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 01001_learning_coach_seed.sql
-- Domain:    AI Learning Coach
-- Purpose:   Seeds default coaching prompt templates and motivation archetypes.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Default Coaching Prompt Templates
-- ─────────────────────────────────────────────────────────────────
INSERT INTO coach_prompt_catalogue (prompt_key, display_name, version, engine_type, template, variables, ab_test_group, is_active)
VALUES
  (
    'daily_advice',
    'Daily Coaching Advice',
    'v1.0.0',
    'COACHING',
    'You are an expert {{examType}} tutor coaching {{studentName}}. Their current readiness score is {{readinessScore}}. Their weakest areas are: {{weakAreas}}. Their study streak is {{studyStreak}} days. Generate focused daily advice in 3 bullet points. Be {{tone}}.',
    '["examType","studentName","readinessScore","weakAreas","studyStreak","tone"]',
    'A',
    TRUE
  ),
  (
    'daily_advice_v2',
    'Daily Coaching Advice (Narrative)',
    'v1.1.0',
    'COACHING',
    'Dear {{studentName}}, here is your personalised coaching message for today. You are preparing for {{examType}} and your current target score is {{targetScore}}. Focus areas: {{weakAreas}}. Study tip of the day: {{studyTip}}.',
    '["studentName","examType","targetScore","weakAreas","studyTip"]',
    'B',
    TRUE
  ),
  (
    'study_plan_generation',
    'Weekly Study Plan Generator',
    'v1.0.0',
    'PLANNING',
    'Generate a 7-day study plan for {{studentName}} preparing for {{examType}} exam on {{examDate}}. Readiness score: {{readinessScore}}. Weak competencies: {{weakCompetencies}}. Available hours per day: {{availableHours}}. Prioritise: {{priorityAreas}}.',
    '["studentName","examType","examDate","readinessScore","weakCompetencies","availableHours","priorityAreas"]',
    'CONTROL',
    TRUE
  ),
  (
    'revision_plan_generation',
    'Revision Campaign Planner',
    'v1.0.0',
    'REVISION',
    'Create a structured {{campaignType}} revision plan for {{studentName}}. Exam date: {{examDate}}. Days remaining: {{daysRemaining}}. Mock test scores: {{mockScores}}. Focus: {{revisionFocusAreas}}. Generate day-by-day revision schedule.',
    '["studentName","campaignType","examDate","daysRemaining","mockScores","revisionFocusAreas"]',
    'CONTROL',
    TRUE
  ),
  (
    'goal_creation',
    'Goal Setting Assistant',
    'v1.0.0',
    'GOAL',
    'Help {{studentName}} set a {{goalType}} study goal. Current performance: {{currentScore}}. Target: {{targetScore}}. Timeline: {{timeline}}. Suggest a SMART goal with measurable milestones.',
    '["studentName","goalType","currentScore","targetScore","timeline"]',
    'CONTROL',
    TRUE
  ),
  (
    'motivation_encouragement',
    'Motivational Encouragement',
    'v1.0.0',
    'MOTIVATION',
    'Generate an encouraging message for {{studentName}} who has a {{studyStreak}}-day study streak. Their recent improvement: {{recentImprovement}}. Motivation style: {{motivationStyle}}. Exam date: {{examDate}}. Keep it under 50 words.',
    '["studentName","studyStreak","recentImprovement","motivationStyle","examDate"]',
    'CONTROL',
    TRUE
  ),
  (
    'motivation_risk_alert',
    'Risk Alert Message',
    'v1.0.0',
    'MOTIVATION',
    'Gently alert {{studentName}} that their readiness score has {{trendDirection}} by {{trendDelta}} points over the last {{trendPeriod}}. Exam is in {{daysToExam}} days. Suggest 1 immediate action. Be supportive, not alarming.',
    '["studentName","trendDirection","trendDelta","trendPeriod","daysToExam"]',
    'CONTROL',
    TRUE
  ),
  (
    'reflection_prompt',
    'Guided Reflection Prompt',
    'v1.0.0',
    'REFLECTION',
    'Guide {{studentName}} through a brief study reflection. Ask about: (1) What went well today? (2) What was challenging? (3) What would they do differently? Keep the tone {{tone}} and supportive.',
    '["studentName","tone"]',
    'CONTROL',
    TRUE
  ),
  (
    'habit_reminder',
    'Habit Study Reminder',
    'v1.0.0',
    'COACHING',
    'Send {{studentName}} a friendly reminder to study today. Their current streak is {{currentStreak}} days. Best study time: {{bestStudyHour}}:00. Today''s suggested task: {{topTask}}. Keep it under 30 words.',
    '["studentName","currentStreak","bestStudyHour","topTask"]',
    'CONTROL',
    TRUE
  ),
  (
    'conversation_summarisation',
    'Conversation Memory Summariser',
    'v1.0.0',
    'CONVERSATION',
    'Summarise this coaching conversation with {{studentName}} in 3-5 bullet points. Extract: (1) Topics covered, (2) Key insights about the student, (3) Follow-up actions agreed. Conversation: {{conversationText}}',
    '["studentName","conversationText"]',
    'CONTROL',
    TRUE
  ),
  (
    'insight_extraction',
    'Coaching Insight Extractor',
    'v1.0.0',
    'INSIGHT',
    'Review {{studentName}}''s recent performance data and extract coaching insights. Prediction trend: {{predictionTrend}}. Evaluation feedback: {{evaluationFeedback}}. Practice stats: {{practiceStats}}. Identify patterns, strengths, and risks.',
    '["studentName","predictionTrend","evaluationFeedback","practiceStats"]',
    'CONTROL',
    TRUE
  )
ON CONFLICT (prompt_key, version) DO NOTHING;
