# Sprint 2.6 Addendum — REST API Contract Specification

## Endpoints Summary

| HTTP Method | Route                                    | Description                           | Auth Required |
| ----------- | ---------------------------------------- | ------------------------------------- | ------------- |
| GET         | `/api/v1/practice/goals`                 | List practice goals                   | Yes (Student) |
| PATCH       | `/api/v1/practice/goals`                 | Create or update practice goal        | Yes (Student) |
| GET         | `/api/v1/practice/retention`             | List spaced retention profiles        | Yes (Student) |
| POST        | `/api/v1/practice/retention/recalculate` | Update retention profile after review | Yes (Student) |
| POST        | `/api/v1/practice/confidence`            | Record answer confidence level        | Yes (Student) |
| GET         | `/api/v1/practice/daily-goals`           | Fetch active adaptive daily goal      | Yes (Student) |
| POST        | `/api/v1/practice/daily-goals`           | Generate new daily goal               | Yes (Student) |
| GET         | `/api/v1/practice/motivation`            | Get streak, XP, and badges            | Yes (Student) |
| GET         | `/api/v1/practice/analytics`             | Fetch multi-dimensional analytics     | Yes (Student) |
| GET         | `/api/v1/practice/focus-areas`           | Get focus area recommendation         | Yes (Student) |
