# Sprint 2.6 Addendum — Repository Inventory

| Repository Interface          | Concrete Implementation               | Package Location        | Storage Table                    |
| ----------------------------- | ------------------------------------- | ----------------------- | -------------------------------- |
| `PracticeSessionRepository`   | `PostgresPracticeSessionRepository`   | `@clasptek/persistence` | `practice_sessions`              |
| `PracticePlanRepository`      | `PostgresPracticePlanRepository`      | `@clasptek/persistence` | `practice_plans`                 |
| `RecommendationRepository`    | `PostgresRecommendationRepository`    | `@clasptek/persistence` | `practice_recommendations`       |
| `StrategyRepository`          | `PostgresStrategyRepository`          | `@clasptek/persistence` | `practice_strategy_registry`     |
| `PracticeGoalRepository`      | `PostgresPracticeGoalRepository`      | `@clasptek/persistence` | `practice_goals`                 |
| `RetentionRepository`         | `PostgresRetentionRepository`         | `@clasptek/persistence` | `retention_profiles`             |
| `DailyGoalRepository`         | `PostgresDailyGoalRepository`         | `@clasptek/persistence` | `daily_goals`                    |
| `MotivationRepository`        | `PostgresMotivationRepository`        | `@clasptek/persistence` | `practice_motivation`            |
| `PracticeAnalyticsRepository` | `PostgresPracticeAnalyticsRepository` | `@clasptek/persistence` | `practice_analytics_projections` |
