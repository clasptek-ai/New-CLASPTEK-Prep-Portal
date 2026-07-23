# Sprint 2.7 API Contract Specification

Base URL: `/api/v1/mock`

### Endpoints

1. `POST /start`: Initializes a new mock examination session.
2. `POST /answer`: Records answer payload and time spent per question.
3. `POST /complete-section`: Locks section and transitions to next section or break.
4. `POST /submit`: Submits active session and triggers scoring engine.
5. `POST /resume`: Resumes paused or disconnected mock session.
6. `GET /history`: Returns historical mock results for authenticated student.
7. `GET /results/{attemptId}`: Returns detailed section scores and official score label.
8. `GET /readiness`: Returns overall readiness percentage and pass probability.
9. `GET /templates`: Returns published full-length mock exam templates.
10. `GET /statistics`: Returns aggregate statistics (total mocks, average score, velocity).
