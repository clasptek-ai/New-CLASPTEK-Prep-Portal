# Sprint 2.5 Addendum Domain Event Catalog

| Event Name            | Aggregate / Trigger                | Payload Schema                              | Business Impact                                             |
| --------------------- | ---------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| `StudentAtRisk`       | `StudentIntervention`              | `{ studentId, riskReason, readinessScore }` | Notifies Learning Analytics & AI Coach of academic risk     |
| `StudyPlanAdjusted`   | `LearningPlan` / `StudyPlanEngine` | `{ planId, reason }`                        | Triggers dynamic recalculation of weekly study schedule     |
| `InstructorNotified`  | `InterventionEngine`               | `{ instructorId, alertMessage }`            | Escalates support ticket for academic reviewer              |
| `StudentReminderSent` | `InterventionEngine`               | `{ studentId, reminderType }`               | Emits push/email notification for student inactivity        |
| `ReadinessDropped`    | `StudentProgress`                  | `{ previousScore, newScore }`               | Logs significant performance degradation in student journey |
