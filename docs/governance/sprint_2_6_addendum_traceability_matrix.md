# Sprint 2.6 Addendum — Requirements Traceability Matrix

| Feature            | Domain Entity             | Application Handler                       | Repository Contract           | API Endpoint                            | UI Component               |
| ------------------ | ------------------------- | ----------------------------------------- | ----------------------------- | --------------------------------------- | -------------------------- |
| Practice Goals     | `StudentPracticeGoal`     | `SetPracticeGoalHandler`                  | `PracticeGoalRepository`      | `GET/PATCH /api/v1/practice/goals`      | `PracticeGoalWidget`       |
| Retention Profile  | `RetentionProfile`        | `UpdateRetentionHandler`                  | `RetentionRepository`         | `GET /api/v1/practice/retention`        | `RetentionDashboardWidget` |
| Confidence Rating  | `ConfidenceLevel`         | `RecordResponseConfidenceHandler`         | N/A                           | `POST /api/v1/practice/confidence`      | `ConfidenceRatingModal`    |
| Daily Goals        | `StudentDailyGoal`        | `GenerateDailyGoalHandler`                | `DailyGoalRepository`         | `GET/POST /api/v1/practice/daily-goals` | `DailyGoalWidget`          |
| Motivation XP      | `StudentMotivation`       | `AwardMotivationPointsHandler`            | `MotivationRepository`        | `GET /api/v1/practice/motivation`       | `MotivationWidget`         |
| Practice Analytics | `TimePerformanceAnalyzer` | `GetPracticeAnalyticsQueryHandler`        | `PracticeAnalyticsRepository` | `GET /api/v1/practice/analytics`        | `practice-screen.tsx`      |
| Focus Areas        | `FocusAreaEngine`         | `GetFocusAreaRecommendationsQueryHandler` | N/A                           | `GET /api/v1/practice/focus-areas`      | `practice-screen.tsx`      |
| 11 Session Modes   | `PracticeSessionType`     | `StartPracticeSessionHandler`             | `PracticeSessionRepository`   | `POST /api/v1/practice/start`           | `practice-screen.tsx`      |
