# Sprint 2.8 — Security & RLS Report

## 1. Tenant Isolation

Tenant isolation is enforced on all prompt and benchmark tables through Row Level Security (RLS) policies:

- `prompt_experiments`
- `prompt_comparisons`
- `prompt_performance_metrics`
- `benchmark_datasets`
- `benchmark_dataset_items`
- `benchmark_runs`
- `benchmark_results`
- `benchmark_regressions`
- `deployment_decisions`

---

## 2. RBAC Policies

- **Admins:** Read-write access to create benchmark datasets, experiments, runs, and resolve regressions.
- **Instructors:** Read-only access to dashboards, experiment reports, and validation summaries.
- **Students:** No access to prompt or benchmark quality tables.
