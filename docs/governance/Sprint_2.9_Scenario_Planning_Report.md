# Phase 2 Sprint 2.9 Addendum — Scenario Planning Report

## Overview

Replaces transient scenario objects with persistent, versioned what-if forecasting models (`TargetScenario`, `ScenarioVersion`, `ScenarioSnapshot`, `ScenarioResult`).

## Simulation Modalities

1. **WRITING_IMPROVEMENT**: Forecasts readiness gain (+5 points per +0.5 band gain).
2. **MOCK_EXAMS**: Forecasts score stability (+3 points per 2 completed mock exams).
3. **STUDY_CONSISTENCY**: Forecasts velocity boost (+4 points for +15% consistency).
4. **READING_ACCURACY**: Forecasts accuracy gain (+4 points for +10% accuracy).
5. **STUDY_TIME**: Forecasts readiness gain (+0.8 points per simulated study hour).

## Persistence

Scenarios and version histories are saved in `target_scenarios`, `scenario_versions`, `scenario_snapshots`, and `scenario_results` with foreign key integrity and version increment triggers.
