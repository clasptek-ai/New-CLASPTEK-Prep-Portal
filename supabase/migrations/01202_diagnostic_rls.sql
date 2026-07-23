-- Migration: 01202_diagnostic_rls.sql
-- Description: Row Level Security (RLS) policies for Diagnostic domain

-- Enable RLS
ALTER TABLE diagnostic_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exposure_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE selection_audits ENABLE ROW LEVEL SECURITY;

-- 1. diagnostic_catalogs Policies
CREATE POLICY admin_all_catalogs ON diagnostic_catalogs
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY select_published_catalogs ON diagnostic_catalogs
  FOR SELECT USING (
    status = 'PUBLISHED' OR (auth.jwt() ->> 'role') IN ('reviewer', 'facilitator', 'program_manager')
  );

-- 2. assessment_forms Policies
CREATE POLICY admin_all_forms ON assessment_forms
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY select_forms ON assessment_forms
  FOR SELECT USING (
    TRUE
  );

-- 3. diagnostic_attempts Policies
CREATE POLICY admin_all_attempts ON diagnostic_attempts
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY student_own_attempts ON diagnostic_attempts
  FOR ALL USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

CREATE POLICY facilitator_view_attempts ON diagnostic_attempts
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('facilitator', 'reviewer', 'program_manager')
  );

-- 4. diagnostic_responses Policies
CREATE POLICY admin_all_responses ON diagnostic_responses
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY student_own_responses ON diagnostic_responses
  FOR ALL USING (
    attempt_id IN (SELECT id FROM diagnostic_attempts WHERE student_id = (auth.jwt() ->> 'sub')::UUID)
  );

CREATE POLICY facilitator_view_responses ON diagnostic_responses
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('facilitator', 'reviewer')
  );

-- 5. placement_results Policies
CREATE POLICY admin_all_placements ON placement_results
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY student_own_placement ON placement_results
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

CREATE POLICY facilitator_view_placements ON placement_results
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('facilitator', 'reviewer', 'program_manager')
  );

-- 6. student_skill_profiles Policies
CREATE POLICY admin_all_profiles ON student_skill_profiles
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY student_own_profile ON student_skill_profiles
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

CREATE POLICY facilitator_view_profiles ON student_skill_profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('facilitator', 'reviewer', 'program_manager')
  );

-- 7. diagnostic_recommendations Policies
CREATE POLICY admin_all_recommendations ON diagnostic_recommendations
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY student_own_recommendations ON diagnostic_recommendations
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

-- 8. exposure_ledger Policies
CREATE POLICY admin_all_exposure ON exposure_ledger
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

CREATE POLICY student_own_exposure ON exposure_ledger
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

-- 9. selection_audits Policies
CREATE POLICY admin_all_selection_audits ON selection_audits
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin', 'reviewer')
  );
