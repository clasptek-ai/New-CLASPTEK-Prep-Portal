# Enterprise Metric Catalog & Business Formulae

## Overview

This catalog defines the enterprise metric catalog, business definitions, formulas, and owners across all platform learning domains.

## Standard Platform Metrics

### 1. Retention Rate (`RETENTION_RATE`)

- **Category**: Student Engagement
- **Formula**: `(Students Active in Days [T - 30, T]) / (Total Enrolled Students) * 100`
- **Refresh Frequency**: Daily at 00:00 UTC
- **Owner**: Student Experience Team (`student-ops@clasptek.com`)

### 2. Readiness Growth Velocity (`READINESS_GROWTH`)

- **Category**: Academic Progress
- **Formula**: `Average (ReadinessScore[T] - ReadinessScore[T-30]) per Cohort`
- **Refresh Frequency**: Realtime / On Demand
- **Owner**: Academic Intelligence Team (`academic-ai@clasptek.com`)

### 3. Institutional Benchmark Percentile (`INSTITUTIONAL_BENCHMARK`)

- **Category**: Executive Governance
- **Formula**: `Rank(CohortScore) / Count(Cohorts) * 100`
- **Refresh Frequency**: Weekly on Monday
- **Owner**: Institutional Analytics Governance (`governance@clasptek.com`)
