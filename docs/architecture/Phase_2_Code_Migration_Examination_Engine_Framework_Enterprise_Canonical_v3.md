# Clasptek Prep Portal V2

# Phase 2 — Code Migration

# Examination Engine Framework Migration Plan (Enterprise Canonical)

**Document Version:** 3.0.0  
**Target Model:** GPT-5.5  
**Release Tag:** `v3.8.0-examination-engine-code-migration`  
**Related ADRs**

- ADR-002 — Examination Engine Framework
- ADR-003 — Question Renderer (Planned)

---

# Objective

Migrate all reusable examination infrastructure into **packages/examination-engine** while preserving existing behaviour and DDD boundaries.

No new features, APIs, database changes or business rules shall be introduced.

---

# Migration Phases

## Phase 1 — Framework Creation

- Create package
- Create interfaces
- Register shared services

## Phase 2 — Code Extraction

- Session Manager
- Timer Engine
- Navigation Engine
- Fullscreen
- Auto Save
- Recovery
- Result Engine

## Phase 3 — Dependency Refactoring

- Replace imports
- Update dependency graph
- Remove duplicated implementations

## Phase 4 — Validation

- Static Analysis
- Architecture Tests
- Unit Tests
- Integration Tests
- Regression Tests

## Phase 5 — Cleanup

- Remove obsolete code
- Remove deprecated interfaces
- Remove unused imports
- Archive superseded documentation

---

# Architecture Transformation

## Before

```text
Assessment
 ├── Timer
 ├── Session
 ├── Navigation

Practice
 ├── Timer
 ├── Session

Mock
 ├── Timer
 ├── Session
```

## After

```text
Assessment
      │
Practice
      │
Mock
      │
Examination Engine
```

---

# Component Inventory

- Session Manager
- Timer Engine
- Navigation Engine
- Fullscreen Controller
- Auto Save Engine
- Recovery Engine
- Integrity Engine
- Progress Tracker
- Result Engine
- Configuration
- Runtime Context
- Runtime Events
- Shared Interfaces

---

# Migration Matrix

| Existing Component | New Location                  |
| ------------------ | ----------------------------- |
| Assessment Timer   | examination-engine/timer      |
| Assessment Session | examination-engine/session    |
| Practice Timer     | examination-engine/timer      |
| Practice Session   | examination-engine/session    |
| Mock Timer         | examination-engine/timer      |
| Mock Session       | examination-engine/session    |
| Shared Navigation  | examination-engine/navigation |
| Shared Recovery    | examination-engine/recovery   |

---

# Interface Responsibilities

| Interface         | Responsibility        |
| ----------------- | --------------------- |
| ISessionManager   | Session lifecycle     |
| ITimerEngine      | Timer lifecycle       |
| INavigationEngine | Navigation state      |
| IAutoSaveEngine   | Automatic persistence |
| IRecoveryEngine   | Recovery workflow     |
| IIntegrityEngine  | Runtime validation    |
| IProgressTracker  | Progress state        |
| IResultEngine     | Generic results       |

---

# Domain Migration Order

## Assessment Delivery

- Replace Session
- Replace Timer
- Replace Navigation

## Practice Delivery

- Replace Session
- Replace Timer
- Replace Navigation

## Mock Delivery

- Replace Session
- Replace Timer
- Replace Navigation
- Replace Recovery
- Replace Fullscreen

---

# Dependency Diagram

```text
kernel
   │
configuration
   │
events
   │
observability
   │
examination-engine
   │
assessment
practice
mock
```

---

# Verification Pipeline

1. Static Analysis
2. Architecture Fitness Tests
3. Unit Tests
4. Integration Tests
5. Regression Tests
6. Manual Smoke Tests
7. pnpm verify

---

# Risks & Mitigations

| Risk                  | Mitigation            |
| --------------------- | --------------------- |
| Broken imports        | Static analysis       |
| Circular dependencies | Architecture tests    |
| Runtime regressions   | Regression suite      |
| Session failures      | Integration tests     |
| Build failures        | Incremental migration |

---

# Rollback Strategy

1. Restore previous package references
2. Restore dependency graph
3. Restore imports
4. Execute regression tests
5. Restore previous release tag if necessary

---

# Version Compatibility

| Component           | Compatible Version |
| ------------------- | ------------------ |
| Assessment Delivery | v3.4+              |
| Practice Delivery   | v3.5+              |
| Mock Delivery       | v3.6+              |

---

# Engineering Metrics

Track

- Shared Components Migrated
- Runtime Services Extracted
- Interfaces Introduced
- Duplicate Files Removed
- Test Coverage
- Build Time Comparison
- Architecture Score
- Documentation Coverage

---

# Success Metrics

- Runtime duplication = 0
- Shared framework adoption = 100%
- Architecture fitness tests = Pass
- Build succeeds
- Architecture Score = 100%

---

# Migration Completion Report

| Item                    | Status |
| ----------------------- | ------ |
| Framework Created       | ☐      |
| Session Migrated        | ☐      |
| Timer Migrated          | ☐      |
| Navigation Migrated     | ☐      |
| Recovery Migrated       | ☐      |
| Imports Updated         | ☐      |
| Duplicate Code Removed  | ☐      |
| Tests Passed            | ☐      |
| Architecture Score 100% | ☐      |

---

# Deliverables

- Examination Engine Framework
- Refactored Assessment Delivery
- Refactored Practice Delivery
- Refactored Mock Delivery
- Migration Matrix
- Interface Catalogue
- Updated Dependency Graph
- Updated Package Inventory
- Migration Report
- Verification Report

---

# Acceptance Criteria

- Zero duplicated runtime logic
- Zero circular dependencies
- All domains consume the Examination Engine
- Existing behaviour preserved
- All automated tests pass
- Ready for Sprint 3.6
