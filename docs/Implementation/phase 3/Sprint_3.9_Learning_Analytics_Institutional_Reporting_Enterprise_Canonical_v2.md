# Clasptek Prep Portal V2

# Sprint 3.9 — Learning Analytics & Institutional Reporting

# Enterprise Canonical Implementation Specification

**Document Version:** 2.0.0  
**Target Model:** GPT-5.5  
**Release Tag:** `v3.12.1-learning-analytics-reporting`

---

# Goal

Implement an enterprise Learning Analytics & Institutional Reporting platform that provides trusted, explainable and versioned institutional intelligence from Assessment, Practice, Mock Examination, AI Evaluation and Academic Progress.

This sprint consumes academic data only and never changes assessment, evaluation or academic records.

---

# Architecture

```text
Assessment
      │
Practice
      │
Mock
      │
AI Evaluation
      │
Academic Progress
      │
Metrics Catalog
      │
Learning Analytics
      │
Institutional Reporting
      │
Executive Dashboard
```

---

# Component 1 — Database

## Migrations

- 00260_learning_analytics.sql
- 00261_analytics_warehouse.sql
- 00262_dashboard_widgets.sql
- 00263_reports.sql
- 00264_benchmarks.sql
- 00265_analytics_rls.sql

## Tables

- analytics_events
- analytics_snapshots
- analytics_kpis
- dashboard_widgets
- institutional_reports
- benchmark_statistics
- metrics_catalog
- report_versions
- export_audit

---

# Component 2 — Domain Packages

## packages/domain/metrics-catalog

Maintains canonical KPI definitions.

Each KPI stores:

- KPI Version
- Formula Version
- Effective Date
- KPI Owner
- Source Domains
- Refresh Policy

## packages/domain/learning-analytics

Owns:

- Analytics
- Dashboards
- Reports
- Benchmarks
- Forecasts

---

# KPI Versioning

Every KPI is immutable.

Each revision creates a new KPI Version.

Historical reports always reference the KPI version used during generation.

---

# Snapshot Strategy

Generate:

- Hourly Operational Snapshot
- Daily Academic Snapshot
- Weekly Trend Snapshot
- Monthly Institutional Snapshot

Snapshots are optimized for dashboard performance.

---

# Trend Analysis Engine

Automatically classify trends:

- Improving
- Stable
- Declining

Trend calculations are versioned and reproducible.

---

# Benchmark Baselines

Support comparisons against:

- Previous Day
- Previous Week
- Previous Month
- Previous Cohort
- Programme Average
- Institution Average

---

# Explainable Analytics

Every executive insight must include:

- Supporting KPIs
- Comparison Baseline
- Time Period
- Confidence Level
- Last Refresh Timestamp

---

# Dashboard Widget Registry

Every widget stores:

- Widget ID
- Version
- Supported Filters
- Required Permissions
- Supported Dashboards

Reusable widgets include:

- KPI Card
- Trend Chart
- Heatmap
- Cohort Comparison
- Skill Distribution
- Forecast Panel
- Timeline

---

# Dashboard Personalization

Allow users to save:

- Default Dashboard
- Preferred Filters
- Widget Layout
- Favourite Reports

Supported for:

- Student
- Administrator
- Executive

---

# Report Lifecycle

```text
Draft
   ↓
Generated
   ↓
Published
   ↓
Archived
```

Reports are versioned and immutable after publication.

---

# Export Governance

Every export records:

- Requester
- Request Time
- Filters
- Export Format
- Data Classification
- Export Status
- Audit Reference

---

# Scheduled Analytics Jobs

- Hourly KPI Refresh
- Nightly Warehouse Aggregation
- Weekly Benchmark Calculation
- Monthly Executive Reports

---

# Operational Monitoring

Track:

- Dashboard Response Time
- Warehouse Refresh Duration
- Snapshot Completion Rate
- Scheduled Job Success Rate
- Failed Report Count
- Export Queue Length
- API Latency
- Architecture Score

---

# Security

- Authentication
- Role-based Authorization
- Row-Level Security
- Audit Logging
- Export Permissions
- Data Masking

---

# Verification

Run:

```bash
pnpm verify
```

Validate:

- KPI Versioning
- Metrics Catalog
- Snapshot Strategy
- Dashboard Widgets
- Reports
- Benchmarks
- Explainable Analytics
- Export Governance

---

# Release Readiness Certificate

| Item                  | Status |
| --------------------- | ------ |
| Architecture          | ✓      |
| Metrics Catalog       | ✓      |
| KPI Versioning        | ✓      |
| Dashboards            | ✓      |
| Reports               | ✓      |
| Warehouse             | ✓      |
| Scheduled Jobs        | ✓      |
| Testing               | ✓      |
| Ready for Sprint 3.10 | ✓      |

---

# Deliverables

- Metrics Catalog
- Learning Analytics Module
- Institutional Reporting
- Executive Dashboard
- Dashboard Widget Registry
- Explainable Analytics
- Export Governance
- REST APIs
- Automated Tests
- Updated Documentation

---

# Success Criteria

Learning Analytics provides explainable, versioned and auditable institutional intelligence built on a canonical Metrics Catalog, reproducible KPI calculations, governed reporting, reusable dashboard components and enterprise-grade operational monitoring without duplicating academic business logic.
