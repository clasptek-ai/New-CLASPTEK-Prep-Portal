# Clasptek Prep Portal V2

# Enterprise Runtime & Operational Architecture

## Production Runtime Governance Specification

**Version:** 2.0.0  
**Status:** Enterprise Baseline

---

# 1. Purpose

This document defines the canonical runtime architecture, operational model, production governance, reliability engineering, monitoring, scaling, and disaster recovery standards for Clasptek Prep Portal V2.

---

# 2. Enterprise Runtime Topology

```text
                   Internet
                       │
                 CDN / WAF
                       │
                Load Balancer
                       │
          ┌────────────┴────────────┐
          │                         │
      Next.js Web              Admin Portal
          │                         │
          └────────────┬────────────┘
                       │
                  API Layer
                       │
      ┌────────────────┼────────────────────┐
      │                │                    │
 Assessment      Identity/Security      Administration
      │                │                    │
      └────────────────┼────────────────────┘
                       │
                Message Broker
      ┌──────────┬───────────┬──────────────┐
      │          │           │              │
 AI Workers  Notification  Analytics   Scheduler
      │          │           │              │
      └──────────┴───────────┴──────────────┘
                       │
         PostgreSQL / Object Storage / Redis
```

---

# 3. Runtime Components

| Component            | Responsibility             | Scaling           |
| -------------------- | -------------------------- | ----------------- |
| Web                  | UI rendering               | Horizontal        |
| API                  | Business services          | Horizontal        |
| Assessment Workers   | Attempt processing         | Queue driven      |
| AI Writing Workers   | Essay evaluation           | Queue driven      |
| AI Speaking Workers  | Speech evaluation          | Queue driven      |
| Notification Workers | Email, SMS, WhatsApp, Push | Queue driven      |
| Analytics Workers    | Aggregation & reporting    | Scheduled + Queue |
| Scheduler            | Cron orchestration         | Singleton         |

---

# 4. Worker Catalogue

| Worker              | Queue                 | Responsibility      |
| ------------------- | --------------------- | ------------------- |
| Writing Evaluation  | ai-writing            | Essay scoring       |
| Speaking Evaluation | ai-speaking           | Speech scoring      |
| Email               | notification-email    | Email delivery      |
| WhatsApp            | notification-whatsapp | WhatsApp delivery   |
| Analytics           | analytics             | KPI aggregation     |
| Import              | imports               | Workbook processing |

---

# 5. Queue Topology

```text
assessment.events
        │
        ▼
ai-writing.queue
        │
        ▼
results.queue
        │
        ├────────► notification.queue
        │
        └────────► analytics.queue
```

Every queue defines producer, consumer group, retry policy, retention, DLQ and ordering guarantees.

---

# 6. Deployment Architecture

Environments:

Development → QA → UAT → Staging → Production → Disaster Recovery

Deployment standards:

- Immutable builds
- Blue/Green or Rolling deployment
- Automated rollback
- Zero-downtime migrations
- Versioned releases

---

# 7. Runtime Configuration Matrix

| Configuration  |   Dev    |   QA    |    Prod    |
| -------------- | :------: | :-----: | :--------: |
| PostgreSQL     |    ✓     |    ✓    |     ✓      |
| Redis          | Optional |    ✓    |     ✓      |
| Object Storage |  Local   |    ✓    |     ✓      |
| AI Provider    |   Mock   |  Live   |    Live    |
| Email          | Sandbox  | Sandbox | Production |

Secrets are stored outside source control and injected at runtime.

---

# 8. Autoscaling Strategy

| Service       |          Trigger | Action       |
| ------------- | ---------------: | ------------ |
| API           |         CPU >70% | Add instance |
| AI Workers    |  Queue >500 jobs | Add workers  |
| Notifications | Queue >1000 jobs | Add workers  |
| Analytics     |         CPU >75% | Add worker   |

---

# 9. AI Runtime Architecture

Includes:

- Prompt Registry
- Prompt Versioning
- Model Registry
- Primary/Fallback Models
- Token Budget Management
- Confidence Thresholds
- Human Review Queue
- AI Cost Monitoring
- Prompt Evaluation Metrics

---

# 10. File Lifecycle

```text
Upload
  │
Virus Scan
  │
Temporary Storage
  │
Validation
  │
Permanent Storage
  │
Archive
  │
Deletion
```

Retention policies apply to each file category.

---

# 11. Backup & Recovery Policy

- Hourly transaction log backups
- Daily full database backup
- Weekly immutable backup
- Encrypted backups
- Quarterly restore testing
- Verified backup integrity

Target:

- RPO: ≤15 minutes
- RTO: ≤2 hours

---

# 12. Observability Architecture

```text
Application
     │
Structured Logs
     │
Log Collector
     │
Metrics + Traces
     │
Observability Platform
     │
Dashboards
     │
Alerts
```

---

# 13. Operational Metrics

## API

- Latency
- Requests/sec
- Error rate

## Database

- Connections
- Slow queries
- Lock contention

## Queues

- Queue depth
- Retry rate
- Processing time

## AI

- Evaluation duration
- Token usage
- Confidence score
- Human review rate

---

# 14. Capacity Planning Assumptions

| Metric                 | Initial Target |
| ---------------------- | -------------: |
| Registered Users       |         10,000 |
| Concurrent Candidates  |            500 |
| Questions              |        100,000 |
| AI Evaluations / Month |         50,000 |
| Storage                |           5 TB |

Review quarterly.

---

# 15. Operational Runbook Index

| ID      | Runbook            |
| ------- | ------------------ |
| OPS-001 | Platform Startup   |
| OPS-002 | Deployment         |
| OPS-003 | Rollback           |
| OPS-004 | Queue Recovery     |
| OPS-005 | Database Migration |
| OPS-006 | Disaster Recovery  |
| OPS-007 | Incident Response  |

---

# 16. Operational State Machine

```text
Provisioned
     │
Running
     │
Degraded
     │
Maintenance
     │
Recovering
     │
Running
```

---

# 17. SLA Catalogue

| Service            |    SLA |
| ------------------ | -----: |
| Authentication     | 99.95% |
| Assessment Runtime | 99.90% |
| AI Evaluation      | 99.50% |
| Analytics          | 99.00% |

---

# 18. Incident Severity Matrix

| Severity    |   Response Target |
| ----------- | ----------------: |
| P1 Critical |            15 min |
| P2 High     |            1 hour |
| P3 Medium   |           4 hours |
| P4 Low      | Next business day |

---

# 19. Production Readiness Checklist

- [ ] Monitoring configured
- [ ] Alerts enabled
- [ ] Health checks passing
- [ ] Backups verified
- [ ] Restore tested
- [ ] Load testing completed
- [ ] Security review approved
- [ ] Documentation updated
- [ ] Runbooks approved

---

# 20. Governance Rules

- No direct production database edits.
- All deployments require automated verification.
- Infrastructure changes are reviewed.
- Runtime changes require ADR updates where applicable.
- Every operational change is auditable.

---

# 21. Definition of Done

Runtime architecture is complete only when:

- Runtime topology documented
- Worker catalogue complete
- Queue topology approved
- Monitoring operational
- Disaster recovery validated
- Performance budgets achieved
- Runbooks published
- SLAs agreed
- Security approved
- Production readiness checklist passed
