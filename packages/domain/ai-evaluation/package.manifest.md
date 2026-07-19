# package: @clasptek/domain-ai-evaluation

## Aggregate Roots
- `EvaluationJob` (lifecycle state machine — QUEUED → RUNNING → COMPLETED → HUMAN_REVIEW_REQUIRED → APPROVED → PUBLISHED → ARCHIVED)
- `EvaluationResult` (immutable scored output — locked after publish)
- `HumanReview` (reviewer workflow — ASSIGNED → IN_REVIEW → ESCALATED → APPROVED → REJECTED → PUBLISHED)
- `EvaluationSnapshot` (immutable capture of submission + question + rubric + model + prompt at evaluation time)
- `EvaluationProfile` (exam-specific evaluation config — rubric, provider, prompt template, confidence thresholds, moderation policy)

## Key Value Objects
- `Score` / `BandScore` (numeric and band scoring)
- `ConfidenceLevel` (0.0 – 1.0 model confidence)
- `PromptHash` (SHA-256 of prompt content)
- `TokenUsage` (prompt / completion / total token counts)
- `CalibrationError` (numeric drift from expected score)

## Key Entities
- `RubricScore` (per-criterion outcome with justification and band descriptor)
- `FeedbackSection` (strengths / improvements / examples / next steps)
- `PromptVersion` (versioned prompt with hash)
- `PromptExecution` (per-evaluation AI provider run with full prompt audit)
- `CalibrationResult` (expected vs observed score, drift, reviewer agreement)
- `EvaluationMetricsRecord` (operational AI latency, token, confidence, override metrics)

## AI Provider Abstraction
- `AIProvider` interface (evaluate, isAvailable)
- Implementations: OpenAI, Anthropic, Gemini, Azure OpenAI, Mock (for CI/test)

## RubricEngine
- criterion scoring, score weighting, band descriptor mapping
