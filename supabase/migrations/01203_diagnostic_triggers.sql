-- Migration: 01203_diagnostic_triggers.sql
-- Description: Trigger functions for updated_at tracking

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_diagnostic_catalogs_updated_at ON diagnostic_catalogs;
DROP TRIGGER IF EXISTS trg_update_assessment_forms_updated_at ON assessment_forms;
DROP TRIGGER IF EXISTS trg_update_diagnostic_attempts_updated_at ON diagnostic_attempts;
DROP TRIGGER IF EXISTS trg_update_diagnostic_responses_updated_at ON diagnostic_responses;
DROP TRIGGER IF EXISTS trg_update_student_skill_profiles_updated_at ON student_skill_profiles;

-- diagnostic_catalogs trigger
CREATE TRIGGER trg_update_diagnostic_catalogs_updated_at
  BEFORE UPDATE ON diagnostic_catalogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- assessment_forms trigger
CREATE TRIGGER trg_update_assessment_forms_updated_at
  BEFORE UPDATE ON assessment_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- diagnostic_attempts trigger
CREATE TRIGGER trg_update_diagnostic_attempts_updated_at
  BEFORE UPDATE ON diagnostic_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- diagnostic_responses trigger
CREATE TRIGGER trg_update_diagnostic_responses_updated_at
  BEFORE UPDATE ON diagnostic_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- student_skill_profiles trigger
CREATE TRIGGER trg_update_student_skill_profiles_updated_at
  BEFORE UPDATE ON student_skill_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
