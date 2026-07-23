-- Migration: 01003_remove_coach_tables.sql
-- Description: Safely drop obsolete AI Coach tables replaced by Sprint 2.10 Intelligent Learning Assistant

DROP TABLE IF EXISTS coach_memory CASCADE;
DROP TABLE IF EXISTS coach_session_memory CASCADE;
DROP TABLE IF EXISTS coach_profile_memory CASCADE;
DROP TABLE IF EXISTS coach_personas CASCADE;
DROP TABLE IF EXISTS coach_plans CASCADE;
DROP TABLE IF EXISTS coach_recovery CASCADE;
DROP TABLE IF EXISTS coach_notes CASCADE;
DROP TABLE IF EXISTS coach_templates CASCADE;
DROP TABLE IF EXISTS coach_analytics CASCADE;
DROP TABLE IF EXISTS coach_recommendations CASCADE;
DROP TABLE IF EXISTS learning_coach_sessions CASCADE;
DROP TABLE IF EXISTS learning_coach_logs CASCADE;
