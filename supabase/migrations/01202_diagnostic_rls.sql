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

-- Drop policies if exist for idempotency
DROP POLICY IF EXISTS admin_all_catalogs ON diagnostic_catalogs;
DROP POLICY IF EXISTS select_published_catalogs ON diagnostic_catalogs;
DROP POLICY IF EXISTS admin_all_forms ON assessment_forms;
DROP POLICY IF EXISTS select_forms ON assessment_forms;
DROP POLICY IF EXISTS admin_all_attempts ON diagnostic_attempts;
DROP POLICY IF EXISTS student_own_attempts ON diagnostic_attempts;
DROP POLICY IF EXISTS facilitator_view_attempts ON diagnostic_attempts;
DROP POLICY IF EXISTS admin_all_responses ON diagnostic_responses;
DROP POLICY IF EXISTS student_own_responses ON diagnostic_responses;
DROP POLICY IF EXISTS facilitator_view_responses ON diagnostic_responses;
DROP POLICY IF EXISTS admin_all_placements ON placement_results;
DROP POLICY IF EXISTS student_own_placement ON placement_results;
DROP POLICY IF EXISTS facilitator_view_placements ON placement_results;
DROP POLICY IF EXISTS admin_all_profiles ON student_skill_profiles;
DROP POLICY IF EXISTS student_own_profile ON student_skill_profiles;
DROP POLICY IF EXISTS facilitator_view_profiles ON student_skill_profiles;
DROP POLICY IF EXISTS admin_all_recommendations ON diagnostic_recommendations;
DROP POLICY IF EXISTS student_own_recommendations ON diagnostic_recommendations;
DROP POLICY IF EXISTS admin_all_exposure ON exposure_ledger;
DROP POLICY IF EXISTS student_own_exposure ON exposure_ledger;
DROP POLICY IF EXISTS admin_all_selection_audits ON selection_audits;

-- 1. diagnostic_catalogs Policies
CREATE POLICY admin_all_catalogs ON diagnostic_catalogs FOR ALL USING (TRUE);
CREATE POLICY select_published_catalogs ON diagnostic_catalogs FOR SELECT USING (TRUE);

-- 2. assessment_forms Policies
CREATE POLICY admin_all_forms ON assessment_forms FOR ALL USING (TRUE);
CREATE POLICY select_forms ON assessment_forms FOR SELECT USING (TRUE);

-- 3. diagnostic_attempts Policies
CREATE POLICY admin_all_attempts ON diagnostic_attempts FOR ALL USING (TRUE);
CREATE POLICY student_own_attempts ON diagnostic_attempts FOR ALL USING (TRUE);
CREATE POLICY facilitator_view_attempts ON diagnostic_attempts FOR SELECT USING (TRUE);

-- 4. diagnostic_responses Policies
CREATE POLICY admin_all_responses ON diagnostic_responses FOR ALL USING (TRUE);
CREATE POLICY student_own_responses ON diagnostic_responses FOR ALL USING (TRUE);
CREATE POLICY facilitator_view_responses ON diagnostic_responses FOR SELECT USING (TRUE);

-- 5. placement_results Policies
CREATE POLICY admin_all_placements ON placement_results FOR ALL USING (TRUE);
CREATE POLICY student_own_placement ON placement_results FOR SELECT USING (TRUE);
CREATE POLICY facilitator_view_placements ON placement_results FOR SELECT USING (TRUE);

-- 6. student_skill_profiles Policies
CREATE POLICY admin_all_profiles ON student_skill_profiles FOR ALL USING (TRUE);
CREATE POLICY student_own_profile ON student_skill_profiles FOR SELECT USING (TRUE);
CREATE POLICY facilitator_view_profiles ON student_skill_profiles FOR SELECT USING (TRUE);

-- 7. diagnostic_recommendations Policies
CREATE POLICY admin_all_recommendations ON diagnostic_recommendations FOR ALL USING (TRUE);
CREATE POLICY student_own_recommendations ON diagnostic_recommendations FOR SELECT USING (TRUE);

-- 8. exposure_ledger Policies
CREATE POLICY admin_all_exposure ON exposure_ledger FOR ALL USING (TRUE);
CREATE POLICY student_own_exposure ON exposure_ledger FOR SELECT USING (TRUE);

-- 9. selection_audits Policies
CREATE POLICY admin_all_selection_audits ON selection_audits FOR ALL USING (TRUE);
