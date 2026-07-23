# Sprint 2.8 — API Contract Specification

## REST API Endpoints

### 1. Prompt Version Comparison

- **POST `/api/v1/ai/prompt/register`**
  - Registers a new prompt version template.
- **POST `/api/v1/ai/prompt/compare`**
  - Compares candidate prompt vs. baseline.
- **GET `/api/v1/ai/prompt/history`**
  - Retrieves experiment history.
- **GET `/api/v1/ai/prompt/performance`**
  - Retrieves prompt metrics.

### 2. Golden Dataset Benchmarks

- **POST `/api/v1/ai/benchmark/run`**
  - Runs a benchmark dataset.
- **GET `/api/v1/ai/benchmark/results`**
  - Retrieves run item details.
- **GET `/api/v1/ai/benchmark/history`**
  - Retrieves run history.
- **GET `/api/v1/ai/benchmark/regressions`**
  - Retrieves regression alerts.

### 3. Deployment gates

- **GET `/api/v1/ai/deployment/decision`**
  - Retrieves deployment go/no-go decisions.
