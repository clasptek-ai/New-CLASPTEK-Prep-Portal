# Enterprise Analytics Warehouse Architecture

## System Architecture

```
[ Domain Microservices ] ──( Domain Events )──> [ Outbox Queue ]
                                                       │
                                                       ▼
                                            [ Background Worker ]
                                                       │
                                                       ▼
                                      [ Postgres Analytics Warehouse ]
                                      ├── analytics_metric_catalog
                                      ├── analytics_snapshots (Aggregate)
                                      ├── analytics_warehouse_projections
                                      ├── analytics_quality_logs
                                      └── analytics_research_export_jobs
                                                       │
                                                       ▼
                                          [ Next.js REST API Layer ]
                                          └── /api/v1/analytics/*
```

## AnalyticsSnapshot Aggregate

Point-in-time snapshot of the entire enterprise analytics state guarantees report consistency across executive dashboards:

- `generatedAt`: Exact timestamp of warehouse view snapshot.
- `warehouseVersion`: Aggregation logic release version.
- `metricVersions`: Exact formula versions applied.
- `benchmarkVersion`: Institutional benchmark calibration version.
- `predictionVersion`: ML model version.
