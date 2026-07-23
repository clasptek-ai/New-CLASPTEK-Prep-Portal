# Sprint 2.5 Addendum REST API Contract Specification

## Endpoints

### 1. Learning Profile API

- `GET /api/v1/student/learning-profile` — Returns student learning pace & weekly hours.
- `PATCH /api/v1/student/learning-profile` — Body: `{ pace: LearningPaceType, weeklyStudyHours?: number }`.

### 2. Exam Target API

- `GET /api/v1/student/exam-target` — Returns target exam date, days remaining, target score, and schedule calculations.
- `PATCH /api/v1/student/exam-target` — Body: `{ journeyId, programmeId, targetExamDate, targetScore?, registrationStatus? }`.

### 3. Readiness Engine API

- `GET /api/v1/student/readiness` — Returns readiness score, level, and last evaluation date.
- `POST /api/v1/student/readiness/recalculate` — Body: `{ diagnosticPerformance?, practiceScores?, mockScores?, curriculumCompletion?, lessonConsistency?, weakSkillAreasCount? }`.

### 4. Intervention Engine API

- `GET /api/v1/student/interventions?activeOnly=true` — Returns active student interventions.
- `POST /api/v1/student/interventions` — Body: `{ daysSinceLastLogin?, missedWeeklyTargets?, repeatedLessonFailures?, weakCompetenciesCount?, missedSessionsCount?, scoreTrend? }`.
- `PATCH /api/v1/student/interventions/[id]` — Body: `{}` (Acknowledges active intervention).
