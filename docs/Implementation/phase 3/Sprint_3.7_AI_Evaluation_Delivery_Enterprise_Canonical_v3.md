# Clasptek Prep Portal V2

# Sprint 3.7 — AI Evaluation Delivery

# Enterprise Canonical Implementation Specification

**Document Version:** 3.0.0  
**Target Model:** GPT-5.5  
**Release Tag:** `v3.10.2-ai-evaluation-delivery`

---

# Goal

Implement the Evaluation Orchestrator that connects Assessment, Practice, and Mock Delivery with the AI Evaluation Engine while remaining provider-independent, observable, and production-ready.

---

# Architecture

```text
Assessment
Practice
Mock
      │
Evaluation Orchestrator
      │
Evaluation Queue
      │
Evaluation Workers
      │
AI Evaluation Engine
      │
Evaluation Results
      │
Student Dashboard
Admin Portal
```

---

# Evaluation State Machine

```text
Queued
   │
Running
   ├──────────────► Completed
   │
   ├──────────────► Needs Review
   │
   └──────────────► Failed
                      │
                      ▼
                    Retry
                      │
                      ▼
                    Running
```

---

# Queue Priorities

| Priority | Typical Work                |
| -------- | --------------------------- |
| High     | Mock Writing / Speaking     |
| Normal   | Practice Writing            |
| Low      | Optional practice & retries |

---

# Submission Sources

- Assessment
- Practice
- Mock

The source is recorded for auditing without introducing business coupling.

---

# Provider Registry

Supported providers:

- OpenAI
- Azure OpenAI
- Anthropic
- Future providers

Provider selection is configuration-driven.

---

# Provider Health Monitoring

Track for every provider:

- Availability
- Average response time
- Error rate
- Queue backlog
- Last successful evaluation
- Health status

---

# Queue Scaling Strategy

```text
Submission
     │
Evaluation Queue
     │
Worker Pool
     │
AI Evaluation Engine
     │
Results Store
```

The architecture supports one worker initially and horizontal scaling in the future.

---

# Immutable Evaluation Versioning

Each completed evaluation permanently stores:

- Evaluation Version
- Prompt Version
- Rubric Version
- Model Version
- Provider Version
- Evaluation Timestamp

Completed evaluations are immutable.

---

# Evaluation Context

Persist:

- Student ID
- Submission ID
- Exam Product
- Section
- Question ID
- Prompt Version
- Rubric Version
- Model Version
- Provider
- Request Timestamp

---

# Failure Policy

Configure:

- Maximum retries
- Retry delay
- Automatic retry
- Manual retry
- Permanent failure
- Needs Review state

---

# Student Workflow

```text
Submitted
   │
Queued
   │
Evaluating
   │
Completed
   │
Feedback Ready
```

Students see:

- Status
- Rubric breakdown
- Feedback
- Improvement suggestions

---

# Admin Operations Dashboard

Display:

- Pending evaluations
- Running evaluations
- Completed today
- Failed jobs
- Retry queue
- Average queue time
- Average evaluation time
- Provider health
- Daily throughput

---

# Notification Hooks

On completion:

```text
Evaluation Complete
      │
Update Database
      │
Refresh Dashboards
      │
Trigger In-App Notification
      │
Optional Email Notification
```

---

# Operational Metrics

Track:

- Queue length
- Average queue time
- Average evaluation time
- Success rate
- Failure rate
- Retry rate
- Daily volume
- Provider latency
- Architecture score

---

# AI Cost Monitoring

Track:

- Input tokens
- Output tokens
- Estimated cost
- Daily spend
- Monthly spend
- Cost per evaluation

---

# Evaluation SLA

| Evaluation Type  |      Target |
| ---------------- | ----------: |
| Writing          | < 2 minutes |
| Speaking         | < 3 minutes |
| Retry Processing | < 5 minutes |

---

# API Rate Limiting

- Queue requests
- Retry requests
- Status polling

Rate limits must be configurable.

---

# Release Readiness Certificate

| Item                  | Status |
| --------------------- | ------ |
| Architecture          | ✓      |
| Queue                 | ✓      |
| Worker Infrastructure | ✓      |
| Provider Registry     | ✓      |
| Provider Health       | ✓      |
| Retry Policy          | ✓      |
| Audit Trail           | ✓      |
| Cost Monitoring       | ✓      |
| Testing               | ✓      |
| Ready for Sprint 3.8  | ✓      |

---

# Deliverables

- Evaluation Orchestrator
- Evaluation Queue
- Worker Infrastructure
- Provider Registry
- Provider Health Dashboard
- Student Evaluation Portal
- Admin Operations Dashboard
- Cost Monitoring
- Notification Hooks
- REST APIs
- Automated Tests
- Updated Documentation

---

# Success Criteria

The platform reliably orchestrates all writing and speaking evaluations through a scalable, provider-independent pipeline with immutable evaluation history, operational monitoring, cost visibility, notification hooks, and enterprise-grade governance while preserving clean DDD boundaries.
