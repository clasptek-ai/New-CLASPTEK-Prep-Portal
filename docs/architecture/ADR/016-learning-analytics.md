# ADR-016: Learning Analytics & Instructor Intelligence Domain Boundaries

## Status
Accepted

## Context
The platform requires a centralized intelligence engine to compile metrics, KPI snapshots, learning trends, and student risk matrices to populate dashboards for Students, Instructors, and Administrators. Transactional domains must not be queried directly by the presentation layer to prevent performance bottlenecks and maintain strong boundary isolation.

## Decision
We establish the `Learning Analytics & Instructor Intelligence` bounded context as a read-only projection domain. It collects metrics from active contexts through application-level ports and outputs read model projections (`AnalyticsProjections`).

### Read Model Boundary Pattern
```
Transaction Domains ──> [ Ports ] ──> Aggregation Engines ──> Projection Store ──> API ──> UI
```
- Dashboard API requests read exclusively from the materialized projection store.
- Writes to other domains' tables are strictly forbidden.

### Performance Targets & SLAs
- Student dashboard load: < 300 ms
- Instructor dashboard load: < 500 ms
- Admin dashboard load: < 800 ms
- Projection refresh (manual): < 5 s
- Scheduled refresh: < 15 min
- Report generation: < 30 s
- Export generation: < 60 s

### Data Visibility Rules (RBAC)
- Students: Access only their own dashboard projections.
- Instructors: Access projections for assigned cohorts.
- Administrators: Read organisation-wide analytics.
