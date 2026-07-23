# package: @clasptek/application-prediction-engine

## Frozen Repository Contracts

- `ReadinessPredictionRepository` — save, findById, findLatestByStudent, findHistoryByStudent, search
- `ReadinessSnapshotRepository` — save, findById, findLatestByStudent
- `PredictionExperimentRepository` — save, findById, findActiveExperiment, findByCode
- `PredictionFeatureRepository` — findByCode, findAllActive
- `ModelVersionRepository` — findById, findCurrentByModelCode

## Commands

- `GeneratePredictionHandler` — create readiness snapshot, fetch active predictor from registry, generate prediction scores, save aggregate
- `PublishPredictionHandler` — publish prediction to student view
- `CreateExperimentHandler` — create new predictor A/B experiment
- `StartExperimentHandler` — activate A/B experiment
- `CompleteExperimentHandler` — complete running A/B experiment
- `TriggerInterventionHandler` — activate proposed student intervention
- `CompleteInterventionHandler` — resolve intervention workflow
- `DiscardInterventionHandler` — discard proposed intervention workflow

## Queries

- `GetLatestPredictionHandler` — fetch latest prediction for student
- `GetPredictionHistoryHandler` — fetch time-series prediction history for student
- `GetActiveExperimentHandler` — fetch active experiment for registry checks
- `SearchPredictionsHandler` — paginated search of predictions for teachers
