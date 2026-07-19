# Clasptek Prep Portal V2

# Domain Event Catalog

# Enterprise Canonical Event Specification

**Document Version:** 2.0.0  
**Baseline ID:** `domain-event-catalog-v2`

---

# Purpose

This document is the authoritative specification for all domain events published and consumed by Clasptek Prep Portal V2. It defines event ownership, contracts, routing, delivery guarantees, versioning and operational governance.

---

# Event Principles

- Domain-Driven Design
- Past-tense event names
- Immutable events
- At-least-once delivery
- Idempotent consumers
- Versioned payloads
- Append-only event history
- Single publisher ownership

---

# Event Classification

| Category     | Example Events                             |
| ------------ | ------------------------------------------ |
| Identity     | UserRegistered, ProfileUpdated             |
| Academic     | AssessmentSubmitted, PracticeCompleted     |
| Evaluation   | EvaluationQueued, EvaluationCompleted      |
| Progress     | ProgressUpdated, ResultsPublished          |
| Analytics    | AnalyticsSnapshotGenerated                 |
| Notification | NotificationCreated, AnnouncementPublished |
| System       | BackupCompleted, QueueRecovered            |

---

# Event Lifecycle Governance

```text
Designed
   ↓
Implemented
   ↓
Versioned
   ↓
Published
   ↓
Deprecated
   ↓
Archived
```

Runtime lifecycle:

```text
Raised → Validated → Published → Consumed → Archived
```

---

# Standard Event Envelope

```json
{
  "eventId": "uuid",
  "eventName": "AssessmentSubmitted",
  "eventVersion": "1.0",
  "payloadVersion": "1.0",
  "occurredAt": "UTC Timestamp",
  "correlationId": "uuid",
  "causationId": "uuid",
  "publisher": "Assessment",
  "payload": {}
}
```

---

# Standard Payload Contract

## Metadata

- eventId
- eventVersion
- payloadVersion
- occurredAt
- correlationId
- causationId

## Business Data

- aggregateId
- aggregateType
- userId (where applicable)
- payload

---

# Event Ownership Matrix

| Event               | Publisher         | Owner             | Consumers                         |
| ------------------- | ----------------- | ----------------- | --------------------------------- |
| UserRegistered      | Identity          | Identity          | Notification                      |
| QuestionsPublished  | Question Bank     | Question Bank     | Assessment                        |
| AssessmentSubmitted | Assessment        | Assessment        | Progress, Analytics, Notification |
| PracticeCompleted   | Practice          | Practice          | Progress, Analytics               |
| MockCompleted       | Mock              | Mock              | Progress, Analytics, Notification |
| EvaluationCompleted | AI Evaluation     | AI Evaluation     | Progress, Analytics, Notification |
| ResultsPublished    | Academic Progress | Academic Progress | Notification                      |
| NotificationCreated | Notification      | Notification      | Delivery Engine                   |

---

# Domain Event Appendix

## Identity

- UserRegistered
- ProfileUpdated

## Question Bank

- QuestionCreated
- QuestionsPublished

## Assessment

- AssessmentStarted
- AssessmentSubmitted

## Practice

- PracticeStarted
- PracticeCompleted

## Mock

- MockStarted
- MockCompleted

## AI Evaluation

- EvaluationQueued
- EvaluationCompleted

## Academic Progress

- ProgressUpdated
- ResultsPublished

## Notification

- NotificationCreated
- AnnouncementPublished

---

# Event Routing Model

```text
Publishing Domain
      │
      ▼
Event Bus
      │
 ├── Academic Progress
 ├── Learning Analytics
 ├── Notification Centre
 └── Background Workers
```

---

# Delivery Guarantees

- At-least-once delivery
- Ordering guaranteed only within an aggregate
- Duplicate delivery is possible
- Consumers must be idempotent

---

# Event Versioning & Compatibility

- Event names remain stable
- Payloads are versioned independently
- Additive fields are backward compatible
- Breaking changes require a new payload version
- Deprecated payload fields remain supported through one release cycle

---

# Retry & Failure Handling

- Exponential backoff
- Configurable retry limit
- Dead-letter queue
- Poison message isolation
- Manual replay support
- Replay audit logging

---

# Event Retention Policy

| Event Type       | Retention |
| ---------------- | --------- |
| Audit Events     | Permanent |
| Business Events  | Permanent |
| Analytics Events | 24 months |
| Queue Records    | 90 days   |

---

# Performance Targets

| Metric              |  Target |
| ------------------- | ------: |
| Publish Latency     | <100 ms |
| Consumer Processing | <500 ms |
| Retry Delay         |   <30 s |
| Dead-letter Rate    |   <0.1% |

---

# Event Testing Strategy

- Publisher tests
- Consumer tests
- Contract tests
- Idempotency tests
- Replay tests
- Failure scenario tests

---

# Naming Standard

Use past-tense business events:

- AssessmentSubmitted
- MockCompleted
- ProgressUpdated

Avoid command-style names:

- SubmitAssessment
- CompleteMock
- UpdateProgress

---

# Security

Never publish:

- Passwords
- Tokens
- Secrets
- Sensitive personal information

Publish only the minimum business data required.

---

# Release Baseline

| Component          | Version  |
| ------------------ | -------- |
| Event Catalog      | v2       |
| Event Envelope     | v1       |
| Payload Versioning | Enabled  |
| Idempotency        | Required |
| Retry Policy       | Enabled  |
| Dead-letter Queue  | Enabled  |

---

# Success Criteria

All domain events are consistently classified, versioned, routed, secured, audited and governed through a single canonical catalog that supports reliable event-driven communication across all bounded contexts in Clasptek Prep Portal V2.
