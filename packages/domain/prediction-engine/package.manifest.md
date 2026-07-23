# package: @clasptek/domain-prediction-engine

## Aggregate Roots

- `ReadinessPrediction` (overall score, confidence, intervals, published/unpublished status, lock version)
- `ReadinessSnapshot` (immutable snapshot of learner state, statistics, mastery, study streak, forecast window)
- `PredictionExperiment` (A/B testing aggregate — control vs challenger model version, traffic split, status, timeline)
- `ReadinessTimeline` [Sprint 2.9 Addendum] (historical timeline aggregate tracking snapshots, velocity slopes, and TrendClassifier states: ACCELERATING, IMPROVING, PLATEAU, DECLINING, RECOVERING)
- `ReadinessStateSnapshot` [Sprint 2.9 Addendum] (promoted aggregate root for historical state, tenant isolation, and competency mastery)
- `PredictionStability` [Sprint 2.9 Addendum] (prediction output variance tracker, volatility state classification: STABLE, IMPROVING, DECLINING, HIGHLY_VOLATILE, and confidence trend)
- `TargetScenario` [Sprint 2.9 Addendum] (persistent what-if scenario aggregate with versioning support: ScenarioVersion, ScenarioSnapshot, ScenarioResult)
- `InstitutionalBenchmark` [Sprint 2.9 Addendum] (anonymized privacy-preserving aggregate storing cohort, instructor, and learning pathway averages)

## Key Value Objects

- `ReadinessScore` (numeric prediction scale for readiness matching exam scale)
- `ConfidenceBand` (confidence percentage and lower/upper score intervals)
- `PredictionFeature` (registry of tracked learner variables — code, type, description)
- `PredictionExplanation` (evidence, contribution factors, feature importance references)
- `InterventionPriority` (CRITICAL, HIGH, MEDIUM, LOW, OPTIONAL risk categorization)
- `ModelConfiguration` (algorithm hyperparameters and weight schemas)
- `ReadinessScoreVO` [Sprint 2.9 Addendum] (0-100 score bounds validation)
- `PredictionVariance` [Sprint 2.9 Addendum] (non-negative score variance metric)
- `StabilityIndex` [Sprint 2.9 Addendum] (0-100 stability score index)
- `ConfidenceScore` [Sprint 2.9 Addendum] (0-100 reliability percentage)
- `SkillWeight` [Sprint 2.9 Addendum] (0.0-1.0 skill weighting factor)
- `ContributionPercentage` [Sprint 2.9 Addendum] (0-100% contribution split)
- `GoalProbability` [Sprint 2.9 Addendum] (0.0-1.0 probability threshold)
- `EstimatedAchievementDate` [Sprint 2.9 Addendum] (projected date value object)
- `ReadinessLearningVelocity` [Sprint 2.9 Addendum] (competencies per week learning velocity rate)
- `TrendDirection` [Sprint 2.9 Addendum] (ACCELERATING, IMPROVING, PLATEAU, DECLINING, RECOVERING direction wrapper)

## Key Entities

- `PredictionFeatureSet` (explicit values of variables at prediction time)
- `PredictionEvidence` (weighted records of student activity, completions, and evaluations)
- `PredictionTrend` (calculated trend metrics — velocity, accuracy, decay slopes)
- `PredictionIntervention` (student risk score, level, trigger details, workflow status)
- `PredictionRecommendation` (action items, priority, target resource competency mappings)
- `PredictionCalibration` (measured drift between expected and observed outcomes per model version)
- `PredictionQualityMetrics` (accuracy, drift, stability, intervention success metrics)
- `PredictionHistory` (time-series logging of overall readiness score history)
- `TimelineTrend` [Sprint 2.9 Addendum] (trend direction, learning velocity, slope, measured timestamp)
- `SkillContribution` [Sprint 2.9 Addendum] (skill name, weight, contribution percentage)
- `ScenarioSnapshot` [Sprint 2.9 Addendum] (simulated input parameters for what-if scenarios)
- `ScenarioResult` [Sprint 2.9 Addendum] (projected readiness score, predicted official score, target date, goal probability)
- `ScenarioVersion` [Sprint 2.9 Addendum] (version wrapper for target scenarios)
- `CohortBenchmark` [Sprint 2.9 Addendum] (anonymized cohort score, percentile rank, peer cohort rank, expected rank)
- `InstructorBenchmark` [Sprint 2.9 Addendum] (anonymized instructor learner count and average readiness)
- `LearningPathwayBenchmark` [Sprint 2.9 Addendum] (pathway velocity slope and average readiness)

## Domain Services & Engines

- `ReadinessTimelineEngine` [Sprint 2.9 Addendum] (computes linear regression slopes, learning velocity, and trend direction states)
- `PredictionStabilityEngine` [Sprint 2.9 Addendum] (evaluates variance and classifies volatility state: STABLE, IMPROVING, DECLINING, HIGHLY_VOLATILE)
- `SkillContributionEngine` [Sprint 2.9 Addendum] (calculates skill weights for Reading, Writing, Listening, Speaking, Grammar, Vocabulary, Study Consistency, ensuring 100% total)
- `ReadinessExplanationEngine` [Sprint 2.9 Addendum] (generates human-readable explanations, priority focus lists, and AI Learning Coach advice)
- `ScenarioPlanningEngine` [Sprint 2.9 Addendum] (runs what-if forecasting simulations for writing improvement, mock exams, study consistency, reading accuracy, study time)
- `ConfidenceAssessmentEngine` [Sprint 2.9 Addendum] (produces PredictionConfidenceReport mapping reliability levels: HIGHLY_RELIABLE, RELIABLE, MODERATE, NEEDS_EVIDENCE)
- `InstitutionalBenchmarkEngine` [Sprint 2.9 Addendum] (aggregates cohort metrics enforcing minimum student thresholds for privacy compliance)

## Domain Events

- `ReadinessImproved` [Sprint 2.9 Addendum]
- `ReadinessDeclined` [Sprint 2.9 Addendum]
- `PredictionVolatilityDetected` [Sprint 2.9 Addendum]
- `ConfidenceChanged` [Sprint 2.9 Addendum]
- `ScenarioCompleted` [Sprint 2.9 Addendum]
- `BenchmarkUpdated` [Sprint 2.9 Addendum]
- `TargetAchieved` [Sprint 2.9 Addendum]
- `TargetMissed` [Sprint 2.9 Addendum]

## Integration Gateways & Projections

- `IReadinessInsightsProvider` [Sprint 2.9 Addendum] (decoupled interface contract for AI Learning Coach queries)
- `StudentReadinessDashboardView`, `InstructorReadinessDashboardView`, `InstitutionBenchmarkView`, `ScenarioProjectionView` [Sprint 2.9 Addendum] (read-only DTO projections)

## Prediction Algorithm Abstraction

- `PredictionEngine` interface (predict)
- Implementations: BayesianPredictor, RegressionPredictor, EnsemblePredictor, WeightedRubricPredictor, MockPredictor
