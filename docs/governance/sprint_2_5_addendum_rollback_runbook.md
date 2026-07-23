# Sprint 2.5 Addendum Rollback Runbook

**Baseline Git Tag:** `pre-sprint-2.5-addendum-baseline`  
**Backup Branch:** `backup/pre-sprint-2.5-addendum`

---

## 1. Codebase Rollback Procedure

```bash
# Step 1: Checkout baseline tag
git checkout pre-sprint-2.5-addendum-baseline

# Step 2: Or reset current branch to backup branch
git reset --hard backup/pre-sprint-2.5-addendum
```

## 2. Database Migration Rollback Procedure

In case database schema changes need to be reverted:

```sql
-- Revert 00506_student_learning_addendum_indexes.sql
DROP INDEX IF EXISTS idx_slp_student_id;
DROP INDEX IF EXISTS idx_slp_pace;
DROP INDEX IF EXISTS idx_spe_target_date;
DROP INDEX IF EXISTS idx_sp_journey_id;
DROP INDEX IF EXISTS idx_sp_student_id;
DROP INDEX IF EXISTS idx_sp_readiness;
DROP INDEX IF EXISTS idx_sp_readiness_level;
DROP INDEX IF EXISTS idx_si_journey_id;
DROP INDEX IF EXISTS idx_si_student_id;
DROP INDEX IF EXISTS idx_si_status;
DROP INDEX IF EXISTS idx_si_type;
DROP INDEX IF EXISTS idx_ih_intervention_id;
DROP INDEX IF EXISTS idx_sa_student_id;
DROP INDEX IF EXISTS idx_sa_read;

-- Revert 00505_student_learning_addendum_rls.sql
DROP POLICY IF EXISTS student_profile_isolation ON student_learning_profiles;
DROP POLICY IF EXISTS student_progress_isolation ON student_progress;
DROP POLICY IF EXISTS student_interventions_isolation ON student_interventions;
DROP POLICY IF EXISTS student_alerts_isolation ON student_alerts;
DROP POLICY IF EXISTS intervention_rules_public_read ON intervention_rules;
DROP POLICY IF EXISTS admin_intervention_rules_bypass ON intervention_rules;
DROP POLICY IF EXISTS admin_profile_bypass ON student_learning_profiles;
DROP POLICY IF EXISTS admin_progress_bypass ON student_progress;
DROP POLICY IF EXISTS admin_interventions_bypass ON student_interventions;
DROP POLICY IF EXISTS admin_history_bypass ON intervention_history;

-- Revert 00504_student_learning_addendum.sql
DROP TABLE IF EXISTS student_alerts CASCADE;
DROP TABLE IF EXISTS intervention_history CASCADE;
DROP TABLE IF EXISTS student_interventions CASCADE;
DROP TABLE IF EXISTS intervention_rules CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
ALTER TABLE student_programme_enrollments
    DROP COLUMN IF EXISTS target_exam_date,
    DROP COLUMN IF EXISTS target_score,
    DROP COLUMN IF EXISTS exam_registration_status;
DROP TABLE IF EXISTS student_learning_profiles CASCADE;
```
