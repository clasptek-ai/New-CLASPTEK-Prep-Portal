# ADR-012 — Assessment Runtime Domain

**Status:** Accepted | **Implementation:** Complete | **Frozen:** Yes

**Date:** 2026-07-16

**Sprint:** 2.7

**Author:** Clasptek Engineering

---

## Context

Sprint 2.7 introduces the **Assessment Runtime Domain** to implement the core execution engine responsible for delivering assessments, managing timers, recording student answers, handling network interruptions, autosaving progress checkpoints, and completing assessment submissions. The runtime must remain decoupled from specific adaptive or mock generation logic, ensuring a robust, high-performance execution container.

---

## Decision

### 1. Two Core Aggregates

- `AssessmentInstance`: Immutable template snapshot containing the assessment definition (QuestionSequence, TimerPolicy, NavigationPolicy, AutosavePolicy, and metadata) (Rec 1).
- `AssessmentSession`: Transactional aggregate root representing a student's active execution instance of an assessment with strict lifecycle state transitions (`READY -> ACTIVE -> PAUSED -> DISCONNECTED -> RESUMED -> SUBMITTING -> SUBMITTED`).

### 2. Snapshot Isolation

To isolate active sessions from question bank updates during execution, the exact question details (IDs, versions, order, and weights) are snapshotted inside `AssessmentInstance` before the session begins (Rec 2).

### 3. Checkpoint & Offline Recovery

Sessions persist monotonic `RuntimeCheckpoint` snapshots tracking the elapsed time, current question, answers JSON, and verification checksums. Checkpoint versions must increase monotonically to prevent backward clock drift or stale data overwrites (Rec 3).

### 4. Client Telemetry & Heartbeats

Periodic telemetry is emitted every 30 seconds via `RuntimeHeartbeat` capturing elapsed time, current active question, browser visibility state, and network status (Rec 4).

### 5. Security Incident Monitoring

An extensible tracking system logs `SecurityIncident` entries capturing anomalies such as WindowFocusLost, ClipboardAbuse, MultipleTabs, DeveloperTools, TimeManipulation, or NetworkTampering.

### 6. Two-Stage Submission

To guarantee receipt delivery and audit trails, submission follows a two-stage commit: transitioning to `SUBMITTING`, generating a signed cryptographic `SubmissionRecord` checksum, and committing as `SUBMITTED`.

### 7. Resume Token Claims

A signed cryptographically secure `ResumeToken` handles secure student reconnections when resuming paused or disconnected sessions.

---

## Integration Rules & Cross-Domain Boundaries

- **READ-ONLY:** reads Question Bank (for initial definition snapshot creation) and Exam Product.
- **WRITE-ONLY:** writes only to Assessment Runtime tables (sessions, answer sheets, checkpoints, statistics, heartbeats, security incidents, submission records).

---

## Performance Targets

| Operation           | Target   |
| ------------------- | -------- |
| Save Answer         | < 50 ms  |
| Autosave Checkpoint | < 100 ms |
| Resume Session      | < 200 ms |
| Heartbeat Log       | < 20 ms  |
| Complete Submission | < 300 ms |
