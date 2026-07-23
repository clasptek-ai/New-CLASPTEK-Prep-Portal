# package: @clasptek/domain-ai-evaluation

## Aggregate Roots

- `EvaluationJob` (lifecycle state machine — QUEUED → RUNNING → COMPLETED → HUMAN_REVIEW_REQUIRED → APPROVED → PUBLISHED → ARCHIVED)
- `EvaluationResult` (immutable scored output — locked after publish)
- `HumanReview` (reviewer workflow — ASSIGNED → IN_REVIEW → ESCALATED → APPROVED → REJECTED → PUBLISHED)
- `EvaluationSnapshot` (immutable capture of submission + question + rubric + model + prompt at evaluation time)
- `EvaluationProfile` (exam-specific evaluation config — rubric, provider, prompt template, confidence thresholds, moderation policy)
- `PromptExperiment` (A/B testing, drift measurement, human comparison) [Sprint 2.8 Addendum]
- `BenchmarkDataset` (immutable locked golden datasets) [Sprint 2.8 Addendum]
- `BenchmarkRun` (automated benchmark execution run) [Sprint 2.8 Addendum]
- `DeploymentDecision` (automated deployment go/no-go gate decisions) [Sprint 2.8 Addendum]

## Key Value Objects

- `Score` / `BandScore` (numeric and band scoring)
- `ConfidenceLevel` (0.0 – 1.0 model confidence)
- `PromptHash` (SHA-256 of prompt content)
- `TokenUsage` (prompt / completion / total token counts)
- `CalibrationError` (numeric drift from expected score)
- `AgreementRate` (pairwise human-AI score agreement within threshold) [Sprint 2.8 Addendum]
- `CalibrationAccuracy` (alignment of AI confidence with actual scoring accuracy) [Sprint 2.8 Addendum]
- `ConfidenceDistribution` (mean, stddev, percentiles of evaluation confidence) [Sprint 2.8 Addendum]
- `EvaluationCost` (estimated token spend in USD) [Sprint 2.8 Addendum]
- `AverageLatency` (average and p95 request duration) [Sprint 2.8 Addendum]
- `ScoreDrift` (average drift difference between versions) [Sprint 2.8 Addendum]

## Key Entities

- `RubricScore` (per-criterion outcome with justification and band descriptor)
- `FeedbackSection` (strengths / improvements / examples / next steps)
- `PromptVersion` (versioned prompt with hash)
- `PromptExecution` (per-evaluation AI provider run with full prompt audit)
- `CalibrationResult` (expected vs observed score, drift, reviewer agreement)
- `EvaluationMetricsRecord` (operational AI latency, token, confidence, override metrics)
- `PromptComparison` (pairwise comparison of candidate and baseline prompt versions) [Sprint 2.8 Addendum]
- `PromptPerformanceMetric` (aggregated performance indicators for a prompt version) [Sprint 2.8 Addendum]
- `BenchmarkDatasetItem` (immutable golden evaluation sample) [Sprint 2.8 Addendum]
- `BenchmarkResult` (evaluation metrics of a single item in a benchmark run) [Sprint 2.8 Addendum]
- `BenchmarkRegression` (detected regression in scoring or performance) [Sprint 2.8 Addendum]

## AI Provider Abstraction

- `AIProvider` interface (evaluate, isAvailable)
- Implementations: OpenAI, Anthropic, Gemini, Azure OpenAI, Mock (for CI/test)

## RubricEngine

- criterion scoring, score weighting, band descriptor mapping
