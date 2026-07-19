# Clasptek Prep Portal V2

# Implementation Roadmap & Build Order

## Enterprise Programme Delivery Blueprint

**Document Version:** 2.0.0  
**Baseline ID:** `implementation-roadmap-v2`

---

# Purpose

This document is the master programme delivery blueprint for Clasptek Prep Portal V2. It defines the implementation sequence, dependencies, governance, quality gates, ownership, environments, release strategy and success metrics for delivering the platform.

---

# Programme Overview

| Phase                              | Priority | Planned Sprint | Status  |
| ---------------------------------- | -------- | -------------: | ------- |
| 0. Foundation                      | Critical |              0 | Planned |
| 1. Core Platform                   | Critical |              1 | Planned |
| 2. Academic Foundation             | Critical |              2 | Planned |
| 3. Assessment Runtime              | Critical |              3 | Planned |
| 4. AI Evaluation                   | High     |              4 | Planned |
| 5. Results & Academic Progress     | High     |              5 | Planned |
| 6. Learning Analytics              | High     |              6 | Planned |
| 7. Communication Centre            | Medium   |              7 | Planned |
| 8. UI Design System Integration    | High     |              8 | Planned |
| 9. Governance Integration          | Critical |              9 | Planned |
| 10. Testing & Production Hardening | Critical |             10 | Planned |

---

# Canonical Governance Documents

Every phase must comply with:

- Architecture Refactor
- Repository Structure Baseline
- Database Schema Baseline
- API Catalog
- Domain Event Catalog
- RBAC Permission Matrix
- State Machine Catalog
- Enterprise UI Design System
- Sprint Specifications

---

# Cross-Cutting Non-Functional Requirements

Apply to **every** phase:

- Security
- Performance
- Accessibility (WCAG 2.2 AA)
- Scalability
- Observability
- Logging
- Backup & Recovery
- Disaster Recovery
- Documentation

---

# Environment Strategy

Development → Integration → Staging → Production

No phase progresses without successful deployment to the preceding environment.

---

# Phase Summary

## Phase 0 – Foundation

**Prerequisites:** None

**Owner:** Platform Engineering

**Deliverables**

- Repository structure
- Shared packages
- CI/CD
- Coding standards
- Development tooling

**Governance**

- Repository Structure Baseline

**Quality Gate**

- Repository builds
- CI green
- Static analysis passes

---

## Phase 1 – Core Platform

**Prerequisites:** Phase 0

**Owner:** Backend Engineering

Deliver:

- Database
- Identity
- Authentication
- RBAC
- Audit Logging
- RLS

Governed by:

- Database Schema
- API Catalog
- RBAC Matrix

---

## Phase 2 – Academic Foundation

**Prerequisites:** Phase 1

Deliver:

- Programmes
- Subjects
- Cohorts
- Question Bank
- Bulk Upload
- Bulk Publish

---

## Phase 3 – Assessment Runtime

**Prerequisites:** Phase 2

Deliver:

- Practice Engine
- Assessment Engine
- Mock Engine
- Candidate Attempt Runtime
- Autosave
- Resume
- Timers

Governed by:

- State Machine Catalog
- Domain Event Catalog

---

## Phase 4 – AI Evaluation

**Prerequisites:** Phase 3

Deliver:

- AI scoring
- Queue processing
- Human moderation
- Retry workflow

---

## Phase 5 – Results & Academic Progress

**Prerequisites:** Phases 3 & 4

Deliver:

- Results Portal
- Progress Dashboard
- Candidate Attempt Review Console

Candidate Attempt Review includes:

- Search students
- Attempt history
- Question-by-question review
- Student answers
- Correct answers
- AI feedback
- Facilitator notes
- Audit timeline
- Permission-controlled score overrides

---

## Phase 6 – Learning Analytics

**Prerequisites:** Phase 5

Deliver:

- Student dashboards
- Cohort analytics
- Executive reporting
- Institutional KPIs

---

## Phase 7 – Communication Centre

**Prerequisites:** Phase 5

Deliver:

- Notifications
- Broadcasts
- Announcements
- Delivery tracking

---

## Phase 8 – UI Design System Integration

**Prerequisites:** Phases 1–7

Deliver:

- Shared component library
- Design tokens
- Storybook
- Responsive layouts
- Accessibility compliance

---

## Phase 9 – Governance Integration

**Prerequisites:** All functional phases

Implement:

- State Machines
- Domain Events
- API Standards
- RBAC Enforcement
- Audit Logging
- Design Tokens

---

## Phase 10 – Testing & Production Hardening

**Prerequisites:** Phase 9

Testing:

- Unit
- Integration
- API
- UI
- Accessibility
- Security
- Performance
- Regression

Hardening:

- Monitoring
- Alerting
- Logging
- Optimization

---

# Dependency Matrix

| Phase | Depends On |
| ----- | ---------- |
| 1     | 0          |
| 2     | 1          |
| 3     | 2          |
| 4     | 3          |
| 5     | 3, 4       |
| 6     | 5          |
| 7     | 5          |
| 8     | 1–7        |
| 9     | 1–8        |
| 10    | 9          |

---

# Feature-to-Phase Matrix

| Feature                  | Phase |
| ------------------------ | ----: |
| Authentication           |     1 |
| RBAC                     |     1 |
| Question Bank            |     2 |
| Assessment Engine        |     3 |
| Practice Engine          |     3 |
| Mock Examination         |     3 |
| AI Evaluation            |     4 |
| Results Portal           |     5 |
| Candidate Attempt Review |     5 |
| Analytics                |     6 |
| Notification Centre      |     7 |
| UI Design System         |     8 |
| Governance               |     9 |
| Production Hardening     |    10 |

---

# Milestones

- M1: Foundation Complete
- M2: Core Platform Ready
- M3: MVP Assessment Platform
- M4: Internal Alpha
- M5: Internal Beta
- M6: Production Release

---

# Risk Register

| Risk                | Mitigation                    |
| ------------------- | ----------------------------- |
| Migration conflicts | Append-only migrations        |
| RBAC defects        | Automated authorization tests |
| AI latency          | Queue architecture            |
| State inconsistency | State machine validation      |
| UI inconsistency    | Design token enforcement      |

---

# Release Strategy

- Feature flags for high-risk functionality
- Incremental rollout
- Rollback plan
- Release approval required before production

---

# Phase Acceptance Checklist

Each phase requires:

- Architecture review
- Security review
- Performance review
- Accessibility review
- API review
- RBAC validation
- State machine validation
- Domain event validation
- Documentation updated
- Automated tests passing

---

# Documentation Deliverables

Each phase updates:

- Architecture documentation
- API documentation
- Database documentation
- Release notes
- ADRs (when architecture changes)

---

# Operational Readiness

Before production:

- Monitoring configured
- Alerts configured
- Backup tested
- Load testing completed
- Security review completed
- Disaster recovery validated
- Support documentation complete

---

# Success Metrics

- Critical-path automated tests ≥95%
- Lighthouse Accessibility ≥95
- Performance targets achieved
- Zero critical security findings
- Governance specifications fully implemented

---

# Post-v1 Roadmap

- Mobile application
- Adaptive learning engine
- AI tutoring assistant
- Multi-tenant institutions
- LMS integrations
- Parent/Guardian portal
- Certificate module (future if required)

---

# Definition of Done

A phase is complete only when all deliverables, governance requirements, quality gates, documentation updates and automated tests are complete, with no unresolved critical defects.
