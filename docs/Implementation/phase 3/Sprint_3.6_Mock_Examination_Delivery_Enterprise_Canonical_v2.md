# Clasptek Prep Portal V2

# Sprint 3.6 — Mock Examination Delivery

# Enterprise Canonical Implementation Specification

**Document Version:** 2.0.0  
**Target Model:** GPT-5.5  
**Release Tag:** `v3.9.0-mock-examination-delivery`

---

# Goal

Implement the production-ready Mock Examination Delivery bounded context using the shared **Examination Engine** and **Question Renderer** frameworks.

This sprint delivers the examination experience only. Question authoring, AI evaluation, readiness prediction and coaching remain in their respective domains.

---

# Scope

## Included

- Official mock delivery
- Fullscreen examination mode
- Session lifecycle
- Question rendering
- Timer & navigation
- Auto-save & recovery
- Review screen
- Submission workflow
- Objective scoring
- Subjective submission queue
- Student results
- Admin monitoring

## Excluded

- AI Writing Evaluation
- AI Speaking Evaluation
- Readiness Prediction
- AI Coach
- Analytics enhancements

---

# Architecture

```text
Authentication
      │
Authorization
      │
Question Bank
      │
Question Renderer
      │
Examination Engine
      │
Mock Delivery
```

---

# Component 1 — Database

## Migrations

- 00230_mock_delivery.sql
- 00231_mock_sessions.sql
- 00232_mock_answers.sql
- 00233_mock_progress.sql
- 00234_mock_results.sql
- 00235_mock_delivery_rls.sql

## Tables

- mock_delivery_sessions
- mock_delivery_answers
- mock_delivery_progress
- mock_delivery_results
- mock_runtime_events
- mock_attempt_history

---

# Component 2 — Domain Package

`packages/domain/mock-delivery`

## Value Objects

- MockDeliveryId
- MockAttemptId
- MockSessionState
- RemainingTime
- SectionIndex

## Entities

- MockSession
- MockAnswer
- MockProgress

## Aggregate

- MockDelivery

## Repository

- MockDeliveryRepository

## Domain Events

- MockStarted
- SectionEntered
- QuestionAnswered
- SectionSubmitted
- MockCompleted

---

# Component 3 — Application Layer

`packages/application/mock-delivery`

## Commands

- StartMock
- SaveAnswer
- SubmitSection
- SubmitMock
- ResumeMock

## Queries

- GetMock
- GetHistory
- GetProgress
- GetResults

Implement CQRS handlers.

---

# Component 4 — Session State Machine

```text
Available
    ↓
Unlocked
    ↓
Started
    ↓
Paused
    ↓
Resumed
    ↓
Completed
    ↓
Reviewed
    ↓
Archived
```

---

# Component 5 — Student Workflow

```text
Dashboard
   ↓
Unlocked Mock
   ↓
Instructions
   ↓
Identity Validation
   ↓
Fullscreen Examination
   ↓
Sections
   ↓
Review
   ↓
Submit
   ↓
Results
```

---

# Component 6 — Admin Workflow

```text
Create Mock
   ↓
Publish
   ↓
Assign / Unlock
   ↓
Student Attempt
   ↓
Monitor
   ↓
Review Results
   ↓
Archive
```

---

# Component 7 — Examination Rules

- Attempt limits
- Resume policy
- Section locking
- Review policy
- Auto-submit on timeout
- Network recovery
- Submission validation

---

# Component 8 — Examination Integrity

- Fullscreen enforcement
- Tab switch detection
- Browser refresh recovery
- Duplicate session detection
- Session timeout
- Audit logging
- Clipboard restrictions (configurable)
- Developer tools detection (future)

---

# Component 9 — User Interface

## Student

- Mock Dashboard
- Instructions
- Examination Screen
- Review Screen
- Results Screen

## Admin

- Mock Library
- Unlock Queue
- Active Sessions
- Attempt History
- Results

---

# Component 10 — Result Processing

Generate:

- Objective Score
- Writing Pending
- Speaking Pending
- Completion %
- Time Used
- Attempt Status
- Submission Timestamp

---

# Component 11 — REST APIs

- GET /api/v1/mock
- GET /api/v1/mock/{id}
- POST /api/v1/mock/start
- POST /api/v1/mock/answer
- POST /api/v1/mock/review
- POST /api/v1/mock/submit
- GET /api/v1/mock/history
- GET /api/v1/mock/results/{attemptId}

---

# Component 12 — Security

- Authentication
- Authorization
- Single active attempt
- Session integrity
- Audit logs
- Fullscreen policy

---

# Component 13 — Testing

- Domain Tests
- Application Tests
- Runtime Tests
- Recovery Tests
- Security Tests
- UI Tests
- Regression Tests

Coverage Targets

- 100% Domain
- 90% Application
- 85% Persistence

---

# Component 14 — Verification Matrix

| Test       | Expected |
| ---------- | -------- |
| Fullscreen | Pass     |
| Timer      | Pass     |
| Navigation | Pass     |
| Auto-save  | Pass     |
| Recovery   | Pass     |
| Submission | Pass     |
| Results    | Pass     |

Run:

```bash
pnpm verify
```

---

# Engineering Metrics

Track:

- Components
- APIs
- Domain Events
- Runtime Services
- Test Coverage
- Build Time
- Architecture Score
- Documentation Coverage

---

# Release Checklist

- [ ] APIs validated
- [ ] Documentation complete
- [ ] Security reviewed
- [ ] Examination Engine verified
- [ ] Question Renderer verified
- [ ] Tests passing
- [ ] Architecture Score = 100%

---

# Deliverables

- Mock Delivery Module
- Student Mock Experience
- Admin Mock Console
- REST APIs
- Automated Tests
- Updated Documentation
- Engineering Metrics Report

---

# Success Criteria

- Production-quality mock examination experience
- Reuses Examination Engine and Question Renderer
- Zero duplicated runtime logic
- Objective scoring completes immediately
- Subjective responses queued for evaluation
- Architecture remains fully compliant with DDD boundaries
