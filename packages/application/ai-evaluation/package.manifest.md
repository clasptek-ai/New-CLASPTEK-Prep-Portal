# package: @clasptek/application-ai-evaluation

## Frozen Repository Contracts

- `EvaluationRepository` — save, findById, findBySubmission, publish, archive, search
- `HumanReviewRepository` — save, findByJob, findPending, assign, nextIdentity
- `ModelRepository` — findById, findByCode, findAll, findCurrentVersion
- `PromptRepository` — findByCode, findCurrentVersion, saveVersion
- `EvaluationProfileRepository` — findByCode, findAll, findActive

## Commands

- `QueueEvaluationHandler` — validate submission, create snapshot, enqueue job
- `RunEvaluationHandler` — dispatch to AI provider, record prompt execution, save result
- `ApproveEvaluationHandler` — human reviewer approval workflow
- `PublishEvaluationHandler` — publish result to student view
- `RequestHumanReviewHandler` — escalate low-confidence evaluations (manual assignment)
- `OverrideScoreHandler` — record human score override with full audit trail

## Queries

- `GetEvaluationHandler` — fetch evaluation result by ID (student-scoped)
- `GetFeedbackHandler` — fetch feedback sections for a result
- `GetConfidenceHandler` — fetch confidence and calibration metadata
- `SearchEvaluationsHandler` — paginated search with filters
