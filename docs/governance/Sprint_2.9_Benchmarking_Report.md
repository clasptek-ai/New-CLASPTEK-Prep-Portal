# Phase 2 Sprint 2.9 Addendum — Institutional Benchmarking Report

## Overview

Provides anonymous cohort, instructor, and learning pathway readiness aggregations for institutional dashboards and peer ranking comparisons.

## Privacy & Anonymization Locks

Enforces a hard minimum threshold of **5 students per cohort/instructor** (`ANONYMIZATION_LOCK_THRESHOLD = 5`). If sample counts fall below 5, records are suppressed to prevent identity re-identification.

## Metrics Exposed

- Overall Institutional Average Readiness
- Percentile Rank (0-100%)
- Peer Cohort Rank (e.g. "Top 15%")
- Expected Rank (A, B, C, D)
- Score distribution curves and forecast windows
