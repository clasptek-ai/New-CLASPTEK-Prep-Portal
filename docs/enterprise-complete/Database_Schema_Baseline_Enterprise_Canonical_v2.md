# Clasptek Prep Portal V2

# Database Schema Baseline

# Enterprise Canonical Database Specification

**Document Version:** 2.0.0  
**Baseline ID:** `db-schema-baseline-v2`  
**Database:** Supabase PostgreSQL 18.x  
**Release Baseline:** `v2.0`

---

# Purpose

This document is the authoritative database baseline for Clasptek Prep Portal V2. It defines schema governance, ownership, relationships, migration strategy, security, lifecycle policies and operational standards.

This document is the single source of truth for database evolution.

---

# Database Principles

- PostgreSQL (Supabase)
- Domain-Driven Design
- Migration-first development
- Row-Level Security by default
- UUID primary keys
- UTC timestamps
- Immutable audit history
- Soft deletes only where approved
- Append-only history for critical records

---

# Schema Versioning

Every production release records:

| Item              | Example         |
| ----------------- | --------------- |
| Schema Version    | v2.0            |
| Release Tag       | v4.0.1          |
| Highest Migration | 00399           |
| Database Engine   | PostgreSQL 18.x |

Schema versions are immutable once released.

---

# Migration Strategy

| Range       | Purpose                                  |
| ----------- | ---------------------------------------- |
| 00001–00099 | Platform Foundation                      |
| 00100–00199 | Academic Foundation & Question Bank      |
| 00200–00299 | Runtime, Assessment, Practice, Mock & AI |
| 00300–00399 | Analytics & Notifications                |
| 00400+      | Future Modules                           |

Migrations are append-only and never edited after production deployment.

---

# Canonical Domain Relationship (ERD Baseline)

```text
Identity
    │
Academic Foundation
    │
Question Bank
    │
Assessment
    │
Practice
    │
Mock Examination
    │
AI Evaluation
    │
Academic Progress
    │
Learning Analytics
    │
Notifications
```

A detailed ERD should be generated from the schema and maintained alongside this baseline.

---

# Domain Ownership Matrix

| Domain              | Primary Tables                            |
| ------------------- | ----------------------------------------- |
| Identity            | profiles, roles, user_roles               |
| Academic Foundation | academies, exam_products, curriculum      |
| Question Bank       | questions, passages, rubrics, skills      |
| Assessment          | assessments, assessment_attempts          |
| Practice            | practice_sessions                         |
| Mock                | mock_sessions, mock_results               |
| AI Evaluation       | ai_evaluation_jobs, ai_evaluation_results |
| Academic Progress   | student_results, academic_progress        |
| Learning Analytics  | analytics_events, analytics_snapshots     |
| Notifications       | notifications, announcements              |

Each table has a single owning bounded context.

---

# Relationship Principles

- One Student → Many Assessment Attempts
- One Student → Many Practice Sessions
- One Student → Many Mock Sessions
- One Question → Many Versions
- One Passage → Many Questions
- One Rubric → Many Questions
- One Student → Many Results

---

# Table Lifecycle

```text
Draft
  ↓
Active
  ↓
Deprecated
  ↓
Archived
```

Tables are never dropped directly in production; deprecation precedes removal.

---

# Immutable Tables

Append-only tables include:

- audit_logs
- ai_evaluation_results
- report_versions
- notification_audit
- analytics_snapshots

Updates are prohibited except through approved migration strategies.

---

# Soft Delete Policy

Soft Delete:

- questions
- learning_resources
- announcements
- collections

Hard Delete:

- temporary queues
- cache tables
- transient worker data

---

# Data Retention Policy

| Data                  | Default Retention |
| --------------------- | ----------------- |
| Audit Logs            | Permanent         |
| AI Evaluation Results | Permanent         |
| Student Results       | Permanent         |
| Notifications         | 12 months         |
| Analytics Events      | 24 months         |
| Queue Records         | 90 days           |

---

# Indexing Strategy

Index:

- Foreign keys
- Status columns
- created_at
- Composite reporting queries
- Frequently searched fields

Review after each major release.

---

# Partition Strategy

Consider partitioning when growth justifies it:

- analytics_events
- audit_logs
- notification_history
- assessment_attempts

Use time-based partitioning where appropriate.

---

# Transaction Policy

Transactions are mandatory for:

- Assessment submission
- Practice completion
- Mock completion
- AI evaluation persistence
- Academic progress updates

Failures must roll back atomically.

---

# Database Event Publishing

The following events publish domain events:

- AssessmentSubmitted
- PracticeCompleted
- MockCompleted
- EvaluationCompleted
- ProgressUpdated
- NotificationCreated

---

# RLS Baseline

- Students access only their own records.
- Administrators access according to RBAC.
- Service roles bypass RLS only where explicitly approved.
- New tables require RLS before release.

---

# Performance Targets

| Operation           |  Target |
| ------------------- | ------: |
| Student Dashboard   | <300 ms |
| Assessment Load     | <500 ms |
| Mock Load           | <500 ms |
| Analytics Dashboard |    <2 s |
| Report Generation   |    <5 s |

---

# Reserved Naming Prefixes

- auth_
- assessment_
- practice_
- mock_
- ai_
- analytics_
- notification_
- audit_

---

# Backup & Recovery

- Daily backups
- Point-in-time recovery
- Quarterly restore testing
- Documented RPO/RTO

---

# Validation Checklist

- [ ] Migrations validated
- [ ] Foreign keys verified
- [ ] RLS verified
- [ ] Indexes reviewed
- [ ] Events verified
- [ ] Rollback tested
- [ ] Seed data loaded
- [ ] Documentation updated

---

# Release Baseline

| Component       | Version              |
| --------------- | -------------------- |
| PostgreSQL      | 18.x                 |
| Schema          | v2.0                 |
| Migration Range | 00001–00399          |
| RLS             | Enabled              |
| Architecture    | DDD Modular Monolith |

---

# Success Criteria

The database schema is governed through versioned migrations, explicit domain ownership, secure access policies, immutable audit records, defined lifecycle rules and measurable operational standards, providing a stable foundation for the Clasptek Prep Portal V2 platform.
