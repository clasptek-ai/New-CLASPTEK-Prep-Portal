# Clasptek Prep Portal V2

# Phase 3 — Architecture Refactoring

# Sprint 3.0A — Examination Engine Framework (Canonical)

**Document Version:** 3.0.0  
**Target Model:** GPT-5.5  
**Release Tag:** `v3.7.0-examination-engine-framework`  
**Related ADR:** ADR-002 — Examination Engine Framework

---

# Objective

Create a reusable **Examination Engine Framework** that centralizes shared examination infrastructure while keeping all business rules inside their respective domains.

---

# Ownership Boundaries

## Owns

- Session lifecycle
- Timer execution
- Navigation
- Fullscreen control
- Auto-save
- Session recovery
- Examination integrity
- Runtime progress
- Generic result generation
- Runtime events

## Does NOT Own

- Question authoring
- Question selection
- Assessment rules
- Practice rules
- Mock rules
- AI evaluation
- Readiness
- Analytics
- Business scoring policies

---

# Architecture Principles

- Domain-agnostic
- Configuration-driven
- Event-driven
- Interface-first
- Stateless where practical
- Dependency inversion
- Reusable across Assessment, Practice and Mock

---

# Target Architecture

```text
Question Bank
      │
Question Renderer
      │
Examination Engine
      │
Assessment Delivery
      │
Practice Delivery
      │
Mock Delivery
```

---

# Runtime Service Registry

| Service         | Interface             | Responsibility     |
| --------------- | --------------------- | ------------------ |
| Session Manager | ISessionManager       | Session lifecycle  |
| Timer Engine    | ITimerEngine          | Timing             |
| Navigation      | INavigationEngine     | Question movement  |
| Fullscreen      | IFullscreenController | Focus mode         |
| Auto Save       | IAutoSaveEngine       | Save & restore     |
| Recovery        | IRecoveryEngine       | Session recovery   |
| Integrity       | IIntegrityEngine      | Runtime validation |
| Progress        | IProgressTracker      | Runtime progress   |
| Results         | IResultEngine         | Generic results    |

---

# Runtime Configuration

Every consuming domain supplies configuration only.

Example (Assessment)

```yaml
fullscreen: false
timeLimit: 45
resume: true
review: true
randomQuestions: false
```

Example (Mock)

```yaml
fullscreen: true
timeLimit: official
resume: policy
review: false
sectionLocking: true
```

---

# Runtime Context

Maintain:

- Session ID
- Candidate ID
- Examination ID
- Attempt Number
- Runtime Configuration
- Current Section
- Current Question
- Answers
- Flags
- Bookmarks
- Remaining Time
- Progress
- Device Timestamp

---

# Runtime State Machine

```text
Created
 ↓
Started
 ↓
Paused
 ↓
Resumed
 ↓
Submitted
 ↓
Completed
 ↓
Archived
```

---

# Event Categories

## Lifecycle

- SessionCreated
- SessionStarted
- SessionPaused
- SessionResumed
- SessionSubmitted
- SessionExpired
- SessionCompleted

## Progress

- AnswerSaved
- SectionCompleted

## Results

- ResultGenerated

---

# Package Structure

```text
packages/
└── examination-engine/
    ├── session/
    │   ├── SessionManager.ts
    │   ├── SessionState.ts
    │   └── ISessionManager.ts
    ├── timer/
    │   ├── TimerEngine.ts
    │   ├── TimerConfiguration.ts
    │   └── ITimerEngine.ts
    ├── navigation/
    ├── fullscreen/
    ├── autosave/
    ├── recovery/
    ├── integrity/
    ├── progress/
    ├── results/
    ├── configuration/
    ├── context/
    ├── events/
    └── shared/
```

---

# Package Dependencies

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
```

The framework must never import downstream business domains.

---

# Plugin Architecture

Future extension point:

```text
plugins/
 ├── timer/
 ├── navigation/
 ├── security/
 ├── telemetry/
 └── analytics/
```

Plugins communicate through interfaces only.

---

# Migration Plan

1. Create `packages/examination-engine`
2. Extract Session Manager
3. Extract Timer Engine
4. Extract Navigation
5. Extract Auto Save
6. Extract Recovery
7. Refactor Assessment
8. Refactor Practice
9. Refactor Mock
10. Verify architecture

---

# Framework Roadmap

| Version | Capability            |
| ------- | --------------------- |
| v1      | Assessment + Mock     |
| v2      | Practice Integration  |
| v3      | Plugin Support        |
| v4      | Telemetry & Analytics |

---

# Engineering Metrics

- Architecture Score
- Shared Components
- Interfaces
- Runtime Events
- Test Coverage
- Cyclomatic Complexity
- Documentation Coverage

---

# Acceptance Criteria

- Zero duplicated runtime logic
- Zero circular dependencies
- All examination domains consume the framework
- Configuration-driven behaviour
- DDD boundaries preserved
- Architecture tests pass

---

# Deliverables

- Examination Engine Framework
- Runtime Service Registry
- Shared Interfaces
- Runtime Configuration Layer
- Runtime Context Model
- Runtime State Machine
- Dependency Map
- Migration Guide
- Updated Architecture Documentation

---

# Success Criteria

The framework becomes the single reusable execution engine for Assessment, Practice and Mock while all business logic remains within their respective domains.
