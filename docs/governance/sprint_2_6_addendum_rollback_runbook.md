# Sprint 2.6 Addendum — Rollback & Emergency Recovery Runbook

**Baseline Tag:** `pre-sprint-2.6-addendum-baseline`  
**Backup Branch:** `backup/pre-sprint-2.6-addendum`  
**Release Tag:** `v1.6.1-adaptive-practice-addendum`

## Rollback Procedure

### Step 1: Database Migration Teardown

Execute SQL teardown commands in Supabase / PostgreSQL:

```sql
DROP TABLE IF EXISTS practice_analytics_projections CASCADE;
DROP TABLE IF EXISTS practice_motivation CASCADE;
DROP TABLE IF EXISTS daily_goals CASCADE;
DROP TABLE IF EXISTS retention_profiles CASCADE;
DROP TABLE IF EXISTS practice_goals CASCADE;
ALTER TABLE practice_session_questions DROP COLUMN IF EXISTS confidence_level, DROP COLUMN IF EXISTS confidence_score;
```

### Step 2: Source Code Reversion

```bash
git checkout backup/pre-sprint-2.6-addendum
git checkout -b main-recovery-sprint-2.6
```

### Step 3: Verification

Run test suites to confirm recovery:

```bash
npx vitest run packages/domain/adaptive-practice/src/index.test.ts
```
