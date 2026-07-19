# Phase 3 Sprint 3.3 — Enterprise Question Bank & Assessment Authoring Domain

## Version 2.0 (Canonical Edition)

> Status: Canonical Implementation Specification (Condensed Edition)

## Vision

The Question Bank & Assessment Authoring Domain is the authoritative source for creating, managing, validating, publishing and governing all assessment content for Clasptek Prep Portal V2.

### Supports

- Diagnostic Assessments
- Practice Assessments
- Mock Examinations

### Does Not Own

- Student Progress
- Curriculum
- Learning Resources
- Enrollment
- Results Analytics

## Objectives

- Single source of truth
- Blueprint-driven authoring
- Reusable content
- Admin-controlled publication
- Immediate scoring where applicable
- Official exam simulation

## Document Status

- **Status:** Canonical
- **Owner:** Clasptek Engineering
- **Version:** 2.1
- **Supersedes:** Sprint 3.3 Draft and Enhancement Addenda v1.1–v1.4
- **Next Review:** Phase 3 Release Review

## Supported Examination Products

- IELTS Academic
- IELTS General
- TOEFL
- CELPIP
- SAT
- English Proficiency

## Domain Responsibilities

### Owns

- Question Packages
- Assessment Blueprints
- Passage Management
- Media Management
- Publishing Workflow
- Versioning
- Validation
- Bulk Import & Export
- Academic Governance

### Does Not Own

- Student Progress
- Assessment Delivery
- Practice Engine
- Mock Examination Engine
- AI Evaluation
- Learning Analytics

## Supported Question Types

- Multiple Choice
- Multiple Select
- True / False
- Matching
- Ordering
- Fill in the Blank
- Short Answer
- Essay
- Reading Comprehension
- Listening Comprehension
- Speaking Prompt
- Writing Task
- SAT Numeric Response

## Core Aggregate Roots

- Question Package
- Assessment Blueprint
- Practice Assessment
- Mock Assessment
- Passage
- Media Asset

## Question Package

Contains:

- Question
- Correct Answer
- Explanation
- Distractor Explanations
- Skill Mapping
- Blueprint Mapping
- Difficulty
- Metadata
- Version History
- Audit Trail

Business Rule: A Question Package is the smallest publishable academic unit.

## Passage Builder

Supports Reading Passages, Listening Scripts, Speaking Cue Cards, Writing Prompts and shared resources with Preview, Publish, Version and Archive.

## Assessment Blueprint Library

Reusable templates:

- IELTS Academic Diagnostic
- IELTS Academic Practice
- IELTS Academic Mock
- TOEFL Diagnostic
- CELPIP Practice
- SAT Diagnostic

Supports Clone, Version, Preview, Validate, Publish and Archive.

## Practice Builder

Workflow:
Choose Exam → Choose Skill → Choose Questions → Configure Feedback → Configure Timing → Preview → Publish → Admin Unlock

Supports:

- Immediate/Delayed Feedback
- Random/Fixed Order
- Question Limit
- Time Limit

## Assessment Builder

Assessment → Select Exam → Select Blueprint → Auto Allocate Questions → Preview → Validate → Publish

## Mock Builder

Preview → Validate → Publish → Lock → Admin Unlock

## Preview System

- Question Preview
- Assessment Preview
- Practice Preview
- Mock Preview
- Desktop
- Tablet
- Exam Mode

## Blueprint Validation

Checks:

- Question Count
- Skill Coverage
- Difficulty Distribution
- Question Type Distribution
- Timing
- Section Order
- Marks Allocation

## Publishing Workflow

Draft → Technical Review → Academic Review → QA → Approved → Queued → Published → Retired → Archived

## Assessment Health Score

Measures:

- Blueprint Coverage
- Skill Coverage
- Difficulty Balance
- Timing Accuracy
- Question Type Distribution

## Dependency Detection

Tracks dependencies between:

- Passages
- Questions
- Media
- Assessments
- Practice Sets
- Mock Exams

## Media Dependency Report

Displays where every media asset is used before deletion.

## Question Locking

Shows current editor, lock time and timeout.

## Bulk Import

Templates:

- Grammar
- Reading
- Listening
- Writing
- Speaking
- SAT Mathematics

Validation:

- Duplicate Detection
- Skill Validation
- Blueprint Validation
- Media Validation

## Student Attempt Review

Displays:

- Question
- Student Answer
- Correct Answer
- Explanation
- Skill
- Difficulty
- Recommendation
- Time Taken
- Attempt Number
- Previous Attempts

## Administration Console

Modules:

- Academic Content
- Grammar
- Reading
- Writing
- Listening
- Speaking
- SAT Mathematics
- Question Bank
- Passages
- Media
- Blueprints
- Assessments
- Practice
- Mocks

## Operational Dashboards

- Publishing Dashboard
- Content Completion Dashboard
- Question Usage Dashboard
- Assessment Health Dashboard

## APIs

Questions:

- POST /api/v1/questions
- GET /api/v1/questions
- PATCH /api/v1/questions/{id}
- POST /api/v1/questions/{id}/retire
- POST /api/v1/questions/{id}/archive
- GET /api/v1/questions/export
- POST /api/v1/questions/import

Assessments:

- POST /api/v1/assessments
- POST /publish
- POST /archive
- GET /preview

Blueprints:

- CRUD
- Validate
- Clone

## Security

- RBAC
- Audit Logs
- Row-Level Security
- Soft Delete
- Versioning
- Optimistic Concurrency

## Testing

- Domain
- Repository
- API
- UI
- Migration
- Architecture

Coverage:

- Domain 100%
- Application 90%
- Persistence 85%

## Acceptance Criteria

- Blueprint Library operational
- Practice Builder operational
- Assessment Builder operational
- Mock Builder operational
- Bulk Import operational
- Preview System operational
- Blueprint Validation operational
- Publishing Queue operational
- Dependency Detection operational
- Question Locking operational
- Student Attempt Review operational
- Administration Console operational
- APIs operational
- Documentation complete
- Architecture Score ≥98%

## Non-Functional Requirements

- High Performance
- Enterprise Security
- Horizontal Scalability
- Complete Auditability
- High Availability
- Version Traceability

## Success Metrics

- Bulk import success rate ≥ 99%
- Zero duplicated published questions
- 100% blueprint validation before publication
- Question publishing fully governed
- Architecture Score ≥ 98%

## Release

Release Tag: **v2.1.0-question-bank-canonical**

This document supersedes all previous Sprint 3.3 drafts and enhancement addenda and is the single implementation reference for Sprint 3.3.
