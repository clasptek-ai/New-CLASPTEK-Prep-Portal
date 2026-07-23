# ADR-014 — Readiness & Prediction Engine Domain

**Status:** Accepted | **Implementation:** Complete | **Frozen:** Yes

**Date:** 2026-07-16

**Sprint:** 2.9

**Author:** Clasptek Engineering

---

## Context

Sprint 2.9 introduces the **Readiness & Prediction Engine Domain** to implement the core analytics and intelligence layer responsible for transforming learner history into readiness forecasts, mastery levels, student risk scores, and recommended interventions. The engine consumes data from other contexts (like AI Evaluation and Student Learning Journey) but is entirely write-decoupled from them.

---

## Decision

### 1. Bounded Domain Boundaries & Aggregates

- `ReadinessPrediction`: Represents the student's readiness state forecast aggregate root containing overall readiness scores, confidence bands, contributor factors, featureSets, trend indicators, and risk alerts.
- `ReadinessSnapshot`: Immutable capture of learner state, competency mastery, statistics, and streaks at prediction calculation time, ensuring historical predictions are completely reproducible.
- `PredictionExperiment`: Aggregate root tracking A/B testing configurations (control vs challenger model versions, traffic splits, start/end dates, and operational status).

### 2. Explicit Feature Registry

Instead of coupling predictive features directly with model algorithms, features are explicitly defined and cataloged in a `PredictionFeature` registry, separating feature engineering from mathematical calculation logic.

### 3. Explainability Model

Every readiness prediction includes a `PredictionExplanation` object containing contributing factors, feature importance weights, confidence explanations, and evidence references.

### 4. Forecast Confidence Intervals

Readiness scores support upper and lower confidence boundaries (`ConfidenceBand`) rather than single percentages to reflect model uncertainty.

### 5. Multi-Strategy Predictor Engine

An extensible `PredictionEngine` strategy interface allows algorithms to be swapped. Four default strategies are implemented:

- **MockPredictor**: For testing, deterministic output.
- **BayesianPredictor**: Bayesian Knowledge Tracing modeling mastery states.
- **RegressionPredictor**: Linear/logistic regression on activity indicators.
- **WeightedRubricPredictor**: Model specific composite sub-scores against rubric criteria.

---

## Integration Rules & Cross-Domain Boundaries

- **READ-ONLY:** reads Student Learning Journey, AI Evaluation, Assessment Runtime, and Question Bank.
- **WRITE-ONLY:** writes only to Prediction Engine tables (snapshots, predictions, explanations, evidence, trends, interventions, experiments, metrics, and history).

---

## Performance Targets

| Operation               | Target   |
| ----------------------- | -------- |
| Generate Snapshot       | < 150 ms |
| Run Predictor Strategy  | < 100 ms |
| Save Prediction         | < 100 ms |
| Query Latest Prediction | < 50 ms  |
| Fetch History Timeline  | < 150 ms |
