# package: @clasptek/domain-prediction-engine

## Aggregate Roots
- `ReadinessPrediction` (overall score, confidence, intervals, published/unpublished status, lock version)
- `ReadinessSnapshot` (immutable snapshot of learner state, statistics, mastery, study streak, forecast window)
- `PredictionExperiment` (A/B testing aggregate — control vs challenger model version, traffic split, status, timeline)

## Key Value Objects
- `ReadinessScore` (numeric prediction scale for readiness matching exam scale)
- `ConfidenceBand` (confidence percentage and lower/upper score intervals)
- `PredictionFeature` (registry of tracked learner variables — code, type, description)
- `PredictionExplanation` (evidence, contribution factors, feature importance references)
- `InterventionPriority` (CRITICAL, HIGH, MEDIUM, LOW, OPTIONAL risk categorization)
- `ModelConfiguration` (algorithm hyperparameters and weight schemas)

## Key Entities
- `PredictionFeatureSet` (explicit values of variables at prediction time)
- `PredictionEvidence` (weighted records of student activity, completions, and evaluations)
- `PredictionTrend` (calculated trend metrics — velocity, accuracy, decay slopes)
- `PredictionIntervention` (student risk score, level, trigger details, workflow status)
- `PredictionRecommendation` (action items, priority, target resource competency mappings)
- `PredictionCalibration` (measured drift between expected and observed outcomes per model version)
- `PredictionQualityMetrics` (accuracy, drift, stability, intervention success metrics)
- `PredictionHistory` (time-series logging of overall readiness score history)

## Prediction Algorithm Abstraction
- `PredictionEngine` interface (predict)
- Implementations: BayesianPredictor, RegressionPredictor, EnsemblePredictor, WeightedRubricPredictor, MockPredictor
