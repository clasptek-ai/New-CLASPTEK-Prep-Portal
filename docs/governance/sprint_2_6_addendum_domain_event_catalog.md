# Sprint 2.6 Addendum — Domain Event Catalogue

| Event Name             | Aggregate Root        | Trigger Condition                                | Payload Structure                                          |
| ---------------------- | --------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `PracticeGoalSet`      | `StudentPracticeGoal` | Student configures or updates a practice goal    | `{ goalId, studentId, goalType }`                          |
| `RetentionUpdated`     | `RetentionProfile`    | Question response is recorded for spaced review  | `{ profileId, studentId, retentionScore, nextReviewDate }` |
| `ConfidenceRecorded`   | `PracticeSession`     | Student rates confidence after answering         | `{ sessionId, questionVersionId, confidenceLevel }`        |
| `DailyGoalCompleted`   | `StudentDailyGoal`    | Required question quota reached for today        | `{ goalId, studentId, date }`                              |
| `MotivationUpdated`    | `StudentMotivation`   | Activity completed and XP / streak awarded       | `{ studentId, xpGained, streak }`                          |
| `FocusAreaRecommended` | `FocusArea`           | System identifies priority competency focus area | `{ studentId, recommendedCategory }`                       |
