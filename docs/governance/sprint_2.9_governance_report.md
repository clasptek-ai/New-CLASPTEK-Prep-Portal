# Sprint 2.9 Governance, Compliance & Registry Report

**Domain:** Readiness & Prediction Engine  
**Status:** Completed | Compliance Verified  
**Date:** 2026-07-16  

---

## 1. OpenAPI Baseline
Below is the REST API specification mapping for the 12 routes implemented under `apps/web/src/app/api/v1/readiness`:

### Predictions Search & Generate
- **GET `/api/v1/readiness`**
  - *Description:* Search historical student predictions.
  - *Query Parameters:* `studentId` (string, required), `profileId` (string, optional), `status` ('DRAFT' | 'PUBLISHED', optional), `limit` (integer, optional), `offset` (integer, optional).
  - *Response:* `200 OK` with JSON `{ predictions: ReadinessPrediction[], count: number }`.
- **POST `/api/v1/readiness`**
  - *Description:* Trigger readiness prediction generation for a student.
  - *Headers:* `x-student-id` (string, required).
  - *Body:* `{ profileId: string, profileCode: string, learnerState: object, latestEvaluationSummaries: object, practiceStatistics: object, studyStreak: object, competencyMastery: object, forecastWindow: string }`.
  - *Response:* `200 OK` with JSON `{ predictionId: string, snapshotId: string, modelVersionId: string }`.

### Latest & History
- **GET `/api/v1/readiness/latest`**
  - *Description:* Retrieve the latest published prediction for a student.
  - *Query Parameters:* `profileId` (string, required).
  - *Response:* `200 OK` with `ReadinessPrediction` body, or `404 Not Found`.
- **GET `/api/v1/readiness/history`**
  - *Description:* Retrieve the timeline series history of published predictions.
  - *Query Parameters:* `profileId` (string, required), `limit` (integer, optional).
  - *Response:* `200 OK` with `{ history: ReadinessPrediction[], count: number }`.

### Predictions Actions
- **POST `/api/v1/readiness/predictions/[id]/publish`**
  - *Description:* Transition a draft prediction to published status.
  - *Response:* `200 OK` with `{ success: true }`.

### Experiments Management
- **GET `/api/v1/readiness/experiments`**
  - *Description:* Fetch the currently running prediction experiment.
  - *Response:* `200 OK` with `{ active: PredictionExperiment | null }`.
- **POST `/api/v1/readiness/experiments`**
  - *Description:* Create a new model A/B testing experiment.
  - *Body:* `{ experimentCode: string, displayName: string, controlModelVersionId: string, challengerModelVersionId: string, trafficSplitPercentage: number }`.
  - *Response:* `200 OK` with `{ experimentId: string }`.
- **POST `/api/v1/readiness/experiments/[id]/start`**
  - *Description:* Activate a draft experiment.
  - *Response:* `200 OK` with `{ success: true }`.
- **POST `/api/v1/readiness/experiments/[id]/complete`**
  - *Description:* Complete a running experiment.
  - *Response:* `200 OK` with `{ success: true }`.

### Interventions Management
- **POST `/api/v1/readiness/predictions/[id]/interventions/[intId]/activate`**
  - *Description:* Trigger/activate a proposed student risk intervention.
- **POST `/api/v1/readiness/predictions/[id]/interventions/[intId]/complete`**
  - *Description:* Close/resolve a student risk intervention.
- **POST `/api/v1/readiness/predictions/[id]/interventions/[intId]/discard`**
  - *Description:* Reject/discard a proposed student risk intervention.

---

## 2. Repository Contracts
We have defined and frozen the following interfaces inside the application package:

- **`ReadinessPredictionRepository`**
  - `save(prediction: ReadinessPrediction): Promise<void>`
  - `findById(id: string): Promise<ReadinessPrediction | null>`
  - `findLatestByStudent(studentId: string, profileId: string): Promise<ReadinessPrediction | null>`
  - `findHistoryByStudent(studentId: string, profileId: string, limit?: number): Promise<ReadinessPrediction[]>`
  - `search(filters: PredictionSearchFilters): Promise<ReadinessPrediction[]>`
- **`ReadinessSnapshotRepository`**
  - `save(snapshot: ReadinessSnapshot): Promise<void>`
  - `findById(id: string): Promise<ReadinessSnapshot | null>`
  - `findLatestByStudent(studentId: string): Promise<ReadinessSnapshot | null>`
- **`PredictionExperimentRepository`**
  - `save(experiment: PredictionExperiment): Promise<void>`
  - `findById(id: string): Promise<PredictionExperiment | null>`
  - `findActiveExperiment(): Promise<PredictionExperiment | null>`
  - `findByCode(code: string): Promise<PredictionExperiment | null>`
- **`PredictionFeatureRepository`**
  - `findByCode(code: string): Promise<any | null>`
  - `findAllActive(): Promise<any[]>`
- **`ModelVersionRepository`**
  - `findById(id: string): Promise<any | null>`
  - `findCurrentByModelCode(modelCode: string): Promise<any | null>`

---

## 3. Database Manifest
The schema migration sql files successfully define 19 database tables:

1. **`prediction_models`**: Tracks core forecasting algorithms.
2. **`prediction_model_versions`**: Manages configurations and code hashes of versions.
3. **`readiness_profiles`**: Links models to exam catalogs (IELTS, TOEFL, SAT).
4. **`readiness_snapshots`**: Immutable snapshots of user state inputs.
5. **`readiness_predictions`**: Parent forecast outcome records.
6. **`prediction_feature_sets`**: Specific feature vectors extracted from snapshots.
7. **`prediction_explanations`**: Explainability contribution factors and descriptions.
8. **`prediction_evidence`**: Input logs and activity source weights.
9. **`prediction_trends`**: Slopes, momentum metrics, and velocity markers.
10. **`prediction_interventions`**: Bounded risk alerts mapped to students.
11. **`prediction_recommendations`**: Recommended action items and lessons.
12. **`prediction_experiments`**: Model A/B experiment splits.
13. **`prediction_history`**: Time-series scores timeline.
14. **`prediction_features`**: Tracks registration catalog of features.
15. **`prediction_thresholds`**: Stores critical triggers for interventions.
16. **`prediction_calibration`**: Records expected vs observed scores.
17. **`prediction_quality_metrics`**: Operational drift, stability, and success rate metrics.
18. **`prediction_input_logs`**: Logs raw snapshot payloads.
19. **`prediction_output_logs`**: Logs raw output predictions.

---

## 4. Model Registry
The seed queries register five pre-calibrated forecasting models:

- **`MOCK`** (MockPredictor): Baseline simulation testing model.
- **`BAYESIAN`** (BayesianPredictor): Bayesian Knowledge Tracing (BKT) competency state calculations.
- **`REGRESSION`** (RegressionPredictor): Multi-factor regression model on velocity, accuracy, and momentum.
- **`WEIGHTED_RUBRIC`** (WeightedRubricPredictor): Composite criterion subscore aggregator mapping to exam band scales.
- **`ENSEMBLE`** (EnsemblePredictor): High-dimension composite model combining multiple predictions.

---

## 5. Engineering Metrics
- **Compilation:** `tsc -b` compiles all domain, application, persistence, and presentation modules with zero errors.
- **Linter Check:** `next lint` reports zero warnings or errors.
- **Testing Coverage:** 
  - Domain tests: 6 tests passing (100%).
  - Application tests: 5 tests passing (100%).
  - Persistence tests: 5 tests passing (100%).
  - Next.js API integration tests: 6 tests passing (100%).

---

## 6. Technical Debt Register
- **Model Training Integrations:** Currently, model training runs out-of-band and model weights are seeded. In a future sprint, a model training endpoint/worker queue should be created.
- **BKT Competency Decay:** BKT transition equations do not currently incorporate time-decay values. A study-decay slope metric could be added to transition matrices.

---

## 7. Sprint 3.0 Readiness Report
> [!IMPORTANT]
> **READINESS RECOMMENDATION: READY FOR SPRINT 3.0**  
> All deliverables for Sprint 2.9 (Readiness & Prediction Bounded Context) have been implemented, verified, and compiled. We are ready to transition to Sprint 3.0.
