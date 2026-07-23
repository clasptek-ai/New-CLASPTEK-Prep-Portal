# Clasptek Prep Portal V4.0 Enterprise Blueprint

## Volume I --- Enterprise Product Architecture

**Version:** 4.0 (Foundational Edition)

> This document is the canonical architectural blueprint for Clasptek
> Prep Portal V2. It defines business intent, product philosophy,
> platform boundaries, domain model, governance, and engineering
> principles. It is intended to evolve as the single source of truth.

---

# Table of Contents

1.  Executive Summary
2.  Product Vision
3.  Product Mission
4.  Strategic Objectives
5.  Product Principles
6.  Stakeholders
7.  User Personas
8.  Business Capability Model
9.  Platform Domains
10. Programme-Centric Architecture
11. Student Lifecycle
12. Assessment-First Learning Model
13. Enterprise Business Rules
14. Security & Governance
15. AI Strategy
16. Analytics Strategy
17. Scalability Principles
18. Non-functional Requirements
19. Product Roadmap
20. Future Volumes

---

# 1. Executive Summary

Clasptek Prep Portal is an enterprise assessment and examination
preparation platform designed for professional training institutes.
Unlike a traditional Learning Management System (LMS), the platform is
assessment-driven, programme-centric, and examination-focused.

Every product decision must reinforce one objective:

> **Help learners become examination-ready through measurable progress,
> authentic testing experiences, structured practice, and actionable
> analytics.**

---

# 2. Product Vision

To become a world-class digital examination preparation platform capable
of supporting multiple international examinations while providing
administrators with complete operational visibility and learners with an
authentic examination experience.

---

# 3. Product Mission

The platform exists to:

- Assess every learner before training.
- Personalise the learning experience.
- Deliver structured practice.
- Simulate official examinations.
- Measure readiness with evidence-based analytics.
- Support AI-assisted evaluation where appropriate.

---

# 4. Strategic Objectives

- Increase examination readiness.
- Improve learner retention.
- Reduce administrative overhead.
- Standardise assessment quality.
- Scale to additional programmes without redesign.

---

# 5. Product Principles

1.  Programme determines the experience.
2.  Assessment precedes training.
3.  Diagnostic assessments are timed.
4.  Assessment navigation is strict.
5.  Practice is learning-oriented.
6.  Mock examinations replicate official conditions.
7.  Every attempt is immutable.
8.  Every action is auditable.
9.  AI augments---not replaces---academic judgement.
10. Accessibility is mandatory.

---

# 6. Stakeholders

- Executive Leadership
- Academic Administration
- Programme Managers
- Content Authors
- Instructors
- Students
- Technical Operations
- Quality Assurance

---

# 7. User Personas

## Student

Goals: - Pass examinations. - Track progress. - Practise effectively.

Pain Points: - Poor time management. - Unclear readiness.

## Academic Administrator

Goals: - Manage programmes. - Monitor learner progress. - Review AI
outcomes.

## Content Author

Goals: - Produce accurate, high-quality assessment content. - Maintain
question banks.

---

# 8. Business Capability Model

Core Capabilities

- Identity & Access
- Programme Management
- Assessment Management
- Practice Management
- Mock Examination Management
- AI Evaluation
- Analytics
- Reporting
- Communication
- Audit & Compliance

---

# 9. Platform Domains

## Admin Workspace

Owns administration, governance, publishing, analytics, AI review,
content, configuration and reporting.

## Student Portal

Owns learning, assessment, practice, examination and performance
reporting.

---

# 10. Programme-Centric Architecture

Programme selection determines:

- Dashboard
- Navigation
- Assessment configuration
- Practice configuration
- Mock configuration
- Resources
- Reporting
- AI workflows

No cross-programme access is permitted unless explicitly granted.

---

# 11. Student Lifecycle

Prospective → Registered → Programme Assigned → Assessment Pending →
Assessment Completed → Training Active → Practice Active → Mock Eligible
→ Programme Completed → Archived

---

# 12. Assessment-First Learning Model

Registration → Programme Allocation → Timed Diagnostic Assessment → AI /
Objective Evaluation → Learning Plan → Guided Practice → Mock
Examination → Readiness Report

---

# 13. Enterprise Business Rules (Sample)

BR-001 Programme determines dashboard.

BR-002 Every assessment is timed.

BR-003 Assessment navigation is strict.

BR-004 Completed sections cannot be revisited.

BR-005 Assessment timer is server-controlled.

BR-006 Attempts are immutable.

BR-007 AI evaluations retain model metadata.

BR-008 Every assessment action is logged.

BR-009 Students may only access assigned programmes.

BR-010 Mock examinations follow official examination rules.

> This catalogue is intended to expand beyond 250 business rules in
> future revisions.

---

# 14. Security & Governance

- Role-Based Access Control
- Audit Logging
- Immutable Assessment Records
- Least-Privilege Permissions
- Secure Session Management

---

# 15. AI Strategy

AI supports:

- Writing evaluation
- Speaking evaluation
- Feedback generation
- Confidence scoring
- Manual review routing

---

# 16. Analytics Strategy

Learner Analytics

- Accuracy
- Speed
- Readiness
- Progress Trends

Operational Analytics

- Programme health
- Completion rates
- AI processing health

---

# 17. Non-functional Requirements

- Responsive UI
- High availability
- Accessibility (WCAG target)
- Horizontal scalability
- Secure APIs
- Reliable auto-save

---

# 18. Product Roadmap

Volume II --- Enterprise UX Blueprint

Volume III --- Examination Engine Specification

Volume IV --- Frontend Screen Specifications

Volume V --- API & Integration Contracts

Volume VI --- QA & Acceptance Catalogue

---

# Closing Note

Version 4.0 is designed as a living enterprise blueprint. Each
subsequent volume expands this foundation until every workflow, screen,
state, business rule, and interaction is fully specified.
