-- Migration: 00501_student_learning_seed
-- Description: Seed reference data for Student Learning Journey Domain

INSERT INTO achievement_definitions (id, code, name, description, icon_key, unlock_criteria, achievement_type, status)
VALUES
    (gen_random_uuid(), 'FIRST_SESSION', 'First Study Session', 'Completed your first study session', 'star-outline', '{"sessions_completed": 1}', 'MILESTONE', 'ACTIVE'),
    (gen_random_uuid(), 'WEEK_STREAK', '7-Day Streak', 'Studied 7 days in a row', 'fire', '{"streak_days": 7}', 'STREAK', 'ACTIVE'),
    (gen_random_uuid(), 'MONTH_STREAK', '30-Day Streak', 'Studied 30 days in a row', 'flame', '{"streak_days": 30}', 'STREAK', 'ACTIVE'),
    (gen_random_uuid(), 'FIRST_GOAL', 'Goal Achiever', 'Completed your first learning goal', 'trophy', '{"goals_completed": 1}', 'GOAL', 'ACTIVE'),
    (gen_random_uuid(), 'FIRST_MODULE', 'Module Master', 'Completed your first module', 'book-check', '{"modules_completed": 1}', 'PROGRESS', 'ACTIVE'),
    (gen_random_uuid(), 'FIRST_PROGRAMME', 'Programme Graduate', 'Completed your first programme', 'graduation-cap', '{"programmes_completed": 1}', 'PROGRESS', 'ACTIVE'),
    (gen_random_uuid(), 'COMPETENCY_80', 'Competency Expert', 'Reached 80%+ mastery in a competency', 'brain', '{"competency_score": 80}', 'COMPETENCY', 'ACTIVE'),
    (gen_random_uuid(), 'HUNDRED_HOURS', 'Century Scholar', 'Accumulated 100 hours of study', 'clock-100', '{"study_hours": 100}', 'TIME', 'ACTIVE')
ON CONFLICT DO NOTHING;
