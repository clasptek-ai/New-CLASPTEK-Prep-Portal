# Phase 2 Sprint 2.9 Addendum — Prediction Stability Report

## Overview

The Prediction Stability Index measures standard deviation variance across model predictions over time to detect score volatility and flag unreliable forecasting states.

## Volatility Classifications

- **STABLE**: Variance < 2.0. High confidence prediction output.
- **IMPROVING**: Upward trend with variance < 4.0.
- **DECLINING**: Downward trend with variance < 4.0.
- **HIGHLY_VOLATILE**: Variance >= 4.0. Indicates inconsistent student performance across mock exams and practice sessions.

## Aggregate Design

`PredictionStability` encapsulates `StabilityIndex` (0-100 score), `PredictionVariance`, `volatilityState`, and `confidenceTrend`.

## Automated Verification

Tested under `packages/domain/prediction-engine/src/addendum.test.ts` and persisted via `PostgresPredictionStabilityRepository`.
