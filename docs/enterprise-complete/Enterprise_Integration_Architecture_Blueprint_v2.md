
# Clasptek Prep Portal V2
# Enterprise Integration Architecture Blueprint
## Canonical Inter-Domain Communication Specification

**Version:** 2.0.0  
**Status:** Enterprise Baseline

---

# 1. Purpose

This blueprint defines the canonical integration architecture for Clasptek Prep Portal V2. It establishes how bounded contexts communicate while preserving domain autonomy, security, resilience, observability, and long-term maintainability.

---

# 2. Integration Principles

- API-first for request/response workflows
- Event-first for business notifications
- No shared database access between domains
- Version all APIs and events
- Backward compatibility by default
- Idempotent operations where applicable
- Eventual consistency for cross-domain processes
- Correlation IDs propagated end-to-end
- Shared Kernel contains only common primitives

---

# 3. Enterprise Integration Topology

```text
Identity
 ├─ Authorization
 ├─ Security
 │
 ▼
Exam Product
 ▼
Curriculum
 ▼
Question Bank
 ▼
Assessment Runtime
 ├─ AI Evaluation
 ├─ Results
 ├─ Notification Centre
 ▼
Analytics

Administration spans every domain.
Infrastructure provides persistence, messaging and observability.
```

---

# 4. Service Dependency Matrix

| Producer | Consumer | Protocol | Sync | Criticality |
|---|---|---|:---:|---|
| Identity | Authorization | Event | No | High |
| Identity | Security | REST | Yes | High |
| Curriculum | Question Bank | REST | Yes | High |
| Question Bank | Assessment Runtime | REST | Yes | Critical |
| Assessment Runtime | AI Evaluation | Event | No | Critical |
| AI Evaluation | Results | Event | No | High |
| Results | Analytics | Event | No | Medium |
| Results | Notification Centre | Event | No | Medium |

---

# 5. API Contract Standards

Every API must define:

- Endpoint
- Method
- Authentication
- Authorization
- Request schema
- Response schema
- Error schema
- Pagination
- Filtering
- Sorting
- Correlation ID
- Version
- Rate limit
- Timeout
- Retry policy

Example:

| Endpoint | Method | Request | Response |
|---|---|---|---|
| /api/v1/questions | GET | Query Params | QuestionCollection |

---

# 6. Event Standards

## Envelope

```json
{
  "eventId": "...",
  "eventType": "...",
  "version": "1.0",
  "occurredAt": "...",
  "correlationId": "...",
  "causationId": "...",
  "producer": "...",
  "payload": {}
}
```

Rules:

- Immutable events
- Versioned schemas
- Idempotency key
- Replay supported
- Dead-letter queue enabled
- Ordered processing where required

---

# 7. Major Sequence Flows

## Student Registration

Identity → UserRegistered → Authorization → Security → Notification Centre

## Assessment Attempt

Question Bank → Assessment Runtime → AnswerSubmitted → AttemptCompleted → Results

## AI Evaluation

Assessment Runtime → EvaluationRequested → AI Evaluation → EvaluationCompleted → Results

---

# 8. Integration Contracts

Each bounded context must document:

- Published APIs
- Consumed APIs
- Published Events
- Consumed Events
- External Systems
- Contract Version

---

# 9. Message Broker Topology

Topics/Queues:

- identity.events
- curriculum.events
- assessment.events
- ai.events
- results.events
- analytics.events
- notification.events

Each queue defines:

- Producer
- Consumer Group
- Retry Policy
- Dead Letter Queue
- Retention
- Ordering

---

# 10. Failure & Resilience

Implement:

- Exponential backoff
- Circuit breakers
- Compensation actions
- Duplicate detection
- Poison message isolation
- Graceful degradation
- Retry budgets

---

# 11. Transaction Strategy

| Pattern | Usage |
|---|---|
| ACID | Single bounded context |
| Saga | Cross-domain workflow |
| Outbox | Reliable event publishing |
| Inbox | Reliable event consumption |
| Eventual Consistency | Analytics & reporting |

---

# 12. Data Ownership Matrix

| Domain | Owns Data |
|---|---|
| Identity | Users, Profiles |
| Authorization | Roles, Permissions |
| Security | Sessions, Trusted Devices |
| Exam Product | Exam Definitions |
| Curriculum | Courses, Modules, Lessons |
| Question Bank | Questions, Versions |
| Assessment Runtime | Attempts, Responses |
| AI Evaluation | Evaluations |
| Results | Scores |
| Analytics | Aggregated Metrics |

---

# 13. Security Architecture

- JWT authentication
- Supabase Auth
- RBAC
- Row-Level Security
- TLS
- Secret management
- API key support for internal integrations
- Audit all privileged operations

---

# 14. Monitoring & Observability

Metrics:

- API latency
- Queue depth
- Event failures
- Retry count
- Error rate

Include:

- Structured logs
- Distributed tracing
- Health checks
- Dashboards
- Alerts

---

# 15. Integration Testing

- Unit
- API Integration
- Consumer-driven Contracts
- Event Contract Tests
- End-to-End
- Load Tests
- Chaos Tests

---

# 16. Error Catalogue

| Code | Meaning |
|---|---|
| INT001 | Contract validation failed |
| INT002 | Timeout |
| INT003 | Authentication failed |
| INT004 | Authorization denied |
| INT005 | Duplicate event |
| INT006 | Schema mismatch |
| INT007 | Downstream unavailable |

---

# 17. Performance Budgets

| Component | Target |
|---|---:|
| API Read | <200 ms |
| API Write | <500 ms |
| Event Delivery | <5 s |
| Queue Retry | <30 s |
| Availability | 99.9% |

---

# 18. Disaster Recovery

- Retry queues
- Dead-letter queues
- Replay events
- Backup event store
- Automated recovery procedures

---

# 19. Governance Checklist

- Architecture reviewed
- API contracts approved
- Event contracts approved
- Security reviewed
- Monitoring configured
- Tests passing
- ADR references updated

---

# 20. Definition of Done

Integration work is complete only when:

- APIs implemented and versioned
- Event contracts implemented
- Sequence flows validated
- Message broker configuration documented
- Monitoring enabled
- Performance targets achieved
- Security review passed
- Automated tests passing
- Documentation updated
