# REST API Specification — Sprint 2.10 (Learning Assistant)

## Endpoints Summary

### 1. Unified Dashboard

- **`GET /api/v1/learning-assistant/dashboard?studentId={id}`**
- Returns active plan, daily tasks, weekly focus, top recommendations, and skill breakdown in a single call.

### 2. Learning Plan Management

- **`GET /api/v1/learning-assistant/plan?studentId={id}`**
- **`POST /api/v1/learning-assistant/plan`** (Body: `GenerateLearningPlanCommand`)

### 3. Daily Tasks

- **`GET /api/v1/learning-assistant/daily?studentId={id}&date={ISO}`**
- **`POST /api/v1/learning-assistant/daily`** (Body: `GenerateDailyTasksCommand`)
- **`POST /api/v1/learning-assistant/tasks/{id}/complete`** (Body: `{ actualMinutes?: number }`)

### 4. Weekly Plan

- **`GET /api/v1/learning-assistant/weekly?studentId={id}&weekStartDate={ISO}`**

### 5. Priority Recommendations

- **`GET /api/v1/learning-assistant/recommendations?studentId={id}`**
- **`POST /api/v1/learning-assistant/recommendations`** (Body: `GenerateRevisionRecommendationsCommand`)

### 6. Skill Analysis

- **`GET /api/v1/learning-assistant/skills?studentId={id}`**
