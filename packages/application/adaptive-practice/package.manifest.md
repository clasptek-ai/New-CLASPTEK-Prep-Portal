# @clasptek/application-adaptive-practice Package Manifest

## Bounded Context

Adaptive Practice Domain

## Responsibilities

- Implements port interfaces for: `PracticeSessionRepository`, `PracticePlanRepository`, `RecommendationRepository`, and `StrategyRepository`.
- Implements pluggable selection strategies registry and execution logics (`WeakestCompetencyFirst`, `BalancedCoverage`, `ExamBlueprintCoverage`, `DifficultyProgression`, `RandomWithinConstraints`).
- Orchestrates eligibility filtering engine checks for active, non-archived questions within difficulty boundaries and spaced repetition cooldown limits.
- Manages command handlers for generation, lifecycle updates (start, pause, resume, complete), and recommendations acceptance.
