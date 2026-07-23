# Sprint 2.8 — Rollback Runbook

## 1. Rollback Steps

To roll back the Sprint 2.8 Addendum:

1. Drop the added tables in reverse order.
2. Revert the database migrations using `supabase db rollback` or manual scripts:
   - `DROP TABLE IF EXISTS deployment_decisions;`
   - `DROP TABLE IF EXISTS benchmark_regressions;`
   - `DROP TABLE IF EXISTS benchmark_results;`
   - `DROP TABLE IF EXISTS benchmark_runs;`
   - `DROP TABLE IF EXISTS benchmark_dataset_items;`
   - `DROP TABLE IF EXISTS benchmark_datasets;`
   - `DROP TABLE IF EXISTS prompt_performance_metrics;`
   - `DROP TABLE IF EXISTS prompt_comparisons;`
   - `DROP TABLE IF EXISTS prompt_experiments;`
3. Delete the following files from the source directories:
   - `packages/domain/ai-evaluation/src/addendum.ts`
   - `packages/domain/ai-evaluation/src/addendum.test.ts`
   - `packages/application/ai-evaluation/src/addendum.ts`
   - `packages/application/ai-evaluation/src/addendum.test.ts`
   - `packages/persistence/src/ai-quality.test.ts`
   - `apps/web/src/app/api/v1/ai/` folder.
   - `apps/web/src/features/ai-quality/` folder.
