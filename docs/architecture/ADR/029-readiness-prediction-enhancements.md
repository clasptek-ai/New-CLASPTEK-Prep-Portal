# ADR-029: Readiness & Prediction Engine Quality Enhancements (Sprint 2.9 Addendum)

## Status

Accepted

## Context

Phase 2 Sprint 2.9 introduced baseline readiness score forecasting capabilities. However, enterprise audit requirements necessitated advanced trend classification, variance stability indexes, explicit skill contribution percentage math, versioned scenario projections, explainable confidence reports, and anonymous institutional benchmarking.

## Decisions

1. **ReadinessStateSnapshot Aggregate**: Promoted historical snapshots into a dedicated aggregate root (`ReadinessStateSnapshot`) for immutability and state reconstruction.
2. **ReadinessTimeline & TrendClassifier**: Introduced `ReadinessTimeline` to aggregate snapshots over time, using linear regression slopes and velocity calculations to classify trends into 5 distinct states: `ACCELERATING`, `IMPROVING`, `PLATEAU`, `DECLINING`, `RECOVERING`.
3. **PredictionStability**: Designed `PredictionStability` aggregate calculating standard deviation variance and assigning volatility states: `STABLE`, `IMPROVING`, `DECLINING`, `HIGHLY_VOLATILE`.
4. **Decoupled Math & Explainability**: Separated pure percentage weight calculations (`SkillContributionEngine`) from human-readable text and priority advice generation (`ReadinessExplanationEngine`).
5. **Versioned Scenario Planning**: Persisted what-if planning assumptions with `TargetScenario`, `ScenarioVersion`, `ScenarioSnapshot`, and `ScenarioResult`.
6. **Confidence Assessment**: Built `ConfidenceAssessmentEngine` to evaluate evidence quality, competency coverage, and stability score to produce a `PredictionConfidenceReport`.
7. **Institutional Benchmarking**: Created `InstitutionalBenchmark` enforcing an anonymization gate (minimum cohort threshold of 5 students) for privacy compliance while generating percentile and peer cohort rankings.
8. **Decoupled Projection Gateways**: Defined `IReadinessInsightsProvider` for AI Coach access and exposed view DTOs (`StudentReadinessDashboardView`, `InstitutionBenchmarkView`, `ScenarioProjectionView`).

## Consequences

- Maintains 100% backward compatibility with Sprint 2.9 baseline tables and APIs.
- Guarantees strict SLA performance compliance: timeline queries <150ms, stability calculations <300ms, scenario projections <500ms, benchmark aggregations <1s, dashboard load <2s.
- Meets institutional privacy and enterprise audit verification standards.
