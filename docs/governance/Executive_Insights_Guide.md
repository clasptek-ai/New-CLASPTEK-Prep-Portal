# Explainable Executive Insights Guide

## Domain Structure

- **`ExecutiveFinding`**: Objective evidence entity containing topic statement, evidence summary (`sampleSize`, `effectSize`, `pValue`), and confidence rating.
- **`ExecutiveInsight`**: Narrative presentation card linked to a primary finding, supporting findings, and recommended strategic actions.
- **Audit Trace**: Every insight card links directly to the underlying `AnalyticsSnapshot` version tag.
