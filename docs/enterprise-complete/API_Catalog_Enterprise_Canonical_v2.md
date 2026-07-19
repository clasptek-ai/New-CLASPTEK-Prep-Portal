# Clasptek Prep Portal V2

# API Catalog

# Enterprise Canonical API Specification

**Document Version:** 2.0.0
**Baseline ID:** `api-catalog-v2`
**API Version:** `v1`
**OpenAPI:** `3.1`

## Purpose

Authoritative API governance reference for Clasptek Prep Portal V2 covering ownership, lifecycle, security, validation, versioning, performance and implementation standards.

## Release Baseline

| Component      | Version              |
| -------------- | -------------------- |
| API            | v1                   |
| OpenAPI        | 3.1                  |
| Authentication | JWT                  |
| Authorization  | RBAC                 |
| Architecture   | DDD Modular Monolith |

## API Ownership Matrix

| Domain            | Prefix             | Owner              |
| ----------------- | ------------------ | ------------------ |
| Identity          | /auth,/profile     | Identity           |
| Question Bank     | /questions         | Question Bank      |
| Assessment        | /assessments       | Assessment         |
| Practice          | /practice          | Practice           |
| Mock              | /mock              | Mock               |
| Evaluation        | /evaluations       | AI Evaluation      |
| Academic Progress | /progress,/results | Academic Progress  |
| Analytics         | /analytics         | Learning Analytics |
| Notifications     | /notifications     | Notification       |

## OpenAPI Governance

- OpenAPI 3.1
- Specification: `/docs/api/openapi.yaml`
- Swagger UI generated from specification
- SDK generation supported
- CI validates specification

## Endpoint Classification

- Public
- Student
- Admin
- Internal
- System

## Authentication & Security

- JWT Bearer
- Service-role for internal services
- RBAC
- CORS policy
- Request/upload size limits
- Refresh-token policy
- Rate limiting

## Request Validation Pipeline

Request → Schema Validation → Type Validation → Authentication → Authorization → Business Rules → Application Layer

## Standard Success Response

```json
{ "success": true, "data": {}, "meta": {}, "errors": [] }
```

## Error Code Catalog

- AUTHENTICATION_FAILED
- AUTHORIZATION_DENIED
- VALIDATION_ERROR
- RESOURCE_NOT_FOUND
- CONFLICT
- RATE_LIMITED
- INTERNAL_ERROR

## Pagination & Filtering

Pagination: page, pageSize
Sorting: sort, direction
Filters: status, programme, studentId, createdAfter, createdBefore

## Idempotency Policy

Required for:

- Bulk Publish
- Evaluation Retry
- Assessment Submit
- Future payment endpoints

## Domain APIs

### Identity

POST /api/v1/auth/login
POST /api/v1/auth/logout
GET /api/v1/profile
PATCH /api/v1/profile

### Question Bank

POST /api/v1/questions
POST /api/v1/questions/bulk-upload
POST /api/v1/questions/bulk-publish
GET /api/v1/questions
GET /api/v1/questions/{id}
PATCH /api/v1/questions/{id}
DELETE /api/v1/questions/{id}

### Assessment

POST /api/v1/assessments/start
POST /api/v1/assessments/{id}/submit
GET /api/v1/assessments/results

### Practice

POST /api/v1/practice/start
POST /api/v1/practice/{id}/submit
GET /api/v1/practice/history

### Mock

POST /api/v1/mock/start
POST /api/v1/mock/{id}/submit
GET /api/v1/mock/history

### AI Evaluation

GET /api/v1/evaluations/{id}
GET /api/v1/evaluations/status
POST /api/v1/evaluations/retry

### Academic Progress

GET /api/v1/progress
GET /api/v1/results
GET /api/v1/results/history

### Learning Analytics

GET /api/v1/analytics/student
GET /api/v1/analytics/cohort
GET /api/v1/analytics/programme
GET /api/v1/analytics/executive

### Notifications

GET /api/v1/notifications
PATCH /api/v1/notifications/{id}/read
GET /api/v1/announcements
POST /api/v1/broadcasts

## API Event Integration

- Assessment Submit → AssessmentSubmitted
- Practice Submit → PracticeCompleted
- Mock Submit → MockCompleted
- Evaluation Retry → EvaluationQueued
- Bulk Publish → QuestionsPublished
- Results Publish → ResultsPublished

## Performance Targets

| API        |  Target |
| ---------- | ------: |
| Login      | <500 ms |
| Dashboard  | <300 ms |
| Assessment | <500 ms |
| Mock       | <500 ms |
| Analytics  |    <2 s |

## API Lifecycle

Draft → Internal → Public → Deprecated → Removed

## API Naming Standards

Use REST nouns (`/questions`, `/questions/{id}`); avoid verb-based endpoints.

## Audit Requirements

Audit authentication, bulk uploads, bulk publish, assessment submissions, mock submissions, evaluation retries and administrative actions.

## Success Criteria

All APIs are versioned, documented, validated, secured and governed through one canonical specification.
