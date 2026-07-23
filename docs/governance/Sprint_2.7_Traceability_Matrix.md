# Sprint 2.7 Traceability Matrix

| Architectural Feature  | Domain Class      | Application Handler              | DB Table          | REST API         | UI Component                    |
| ---------------------- | ----------------- | -------------------------------- | ----------------- | ---------------- | ------------------------------- |
| Blueprint Authoring    | `MockBlueprint`   | `TemplatePublishingOrchestrator` | `mock_blueprints` | N/A              | `instructor-mock-dashboard.tsx` |
| Template Publishing    | `MockTemplate`    | `GetTemplatesHandler`            | `mock_templates`  | `GET /templates` | `student-mock-dashboard.tsx`    |
| Exam Session Execution | `MockSession`     | `StartMockHandler`               | `mock_sessions`   | `POST /start`    | `student-mock-dashboard.tsx`    |
| Question Answers       | `MockAttempt`     | `SubmitAnswerHandler`            | `mock_attempts`   | `POST /answer`   | `mock-exam-arena.tsx`           |
| Multi-Exam Scoring     | `ScoringEngine`   | `SubmitMockHandler`              | `mock_results`    | `POST /submit`   | `score-prediction-card.tsx`     |
| Exam Readiness         | `ReadinessEngine` | `CalculateReadinessHandler`      | `mock_readiness`  | `GET /readiness` | `score-prediction-card.tsx`     |
