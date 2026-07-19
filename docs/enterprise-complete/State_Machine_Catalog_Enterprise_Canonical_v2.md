# Clasptek Prep Portal V2

# State Machine Catalog

## Enterprise Canonical Workflow Specification

**Document Version:** 2.0.0  
**Baseline ID:** `state-machine-catalog-v2`

> This document is the authoritative specification for all business state machines in Clasptek Prep Portal V2.

---

# 1. Purpose

Defines lifecycle governance, transition rules, actors, guard conditions, rollback policies, domain events, UI mappings and audit requirements for every business workflow.

---

# 2. State Machine Principles

- Explicit transitions only
- Invalid transitions rejected
- Every transition audited
- Domain events published after successful transitions
- Business state separated from UI state
- Terminal states immutable unless administrative recovery is allowed

---

# 3. State Machine Registry

| State Machine          | Aggregate         | Owning Domain      |
| ---------------------- | ----------------- | ------------------ |
| Question Lifecycle     | Question          | Question Bank      |
| Assessment Lifecycle   | Assessment        | Assessment         |
| Practice Lifecycle     | Practice Session  | Practice           |
| Mock Lifecycle         | Mock Session      | Mock Examination   |
| AI Evaluation          | Evaluation Job    | AI Evaluation      |
| Results Lifecycle      | Result            | Academic Progress  |
| Student Progress       | Student Progress  | Academic Progress  |
| Notification Lifecycle | Notification      | Notification       |
| Bulk Upload Lifecycle  | Import Job        | Question Bank      |
| Candidate Attempt      | Candidate Attempt | Assessment Runtime |

---

# 4. Standard State Definition Template

Each state must define:

- Business meaning
- Allowed transitions
- Guard conditions
- Responsible actor
- Published events
- UI visibility
- Terminal status
- Rollback policy

---

# 5. Question Lifecycle

```text
Draft → Review → Approved → Published → Archived
```

| Current   | Action  | Next      | Actor          |
| --------- | ------- | --------- | -------------- |
| Draft     | Submit  | Review    | Facilitator    |
| Review    | Approve | Approved  | Academic Admin |
| Approved  | Publish | Published | Academic Admin |
| Published | Archive | Archived  | Academic Admin |

---

# 6. Assessment Lifecycle

```text
Draft → Scheduled → Available → In Progress → Submitted → Evaluated → Published → Archived
```

Failure:

```text
In Progress → Submission Failed → Retry → Submitted
```

Timeout:

```text
In Progress → Timed Out
```

---

# 7. Practice Lifecycle

```text
Created → Started → Paused → Resumed → Completed → Evaluated
```

---

# 8. Mock Examination Lifecycle

```text
Scheduled → Available → Started → Paused → Submitted → Evaluated → Results Published
```

---

# 9. AI Evaluation Lifecycle

```text
Queued → Processing → Completed
```

Failure:

```text
Queued → Processing → Failed → Retry Queued → Processing
```

---

# 10. Results Lifecycle

```text
Generated → Reviewed → Published → Archived
```

Publishing failure:

```text
Generated → Publishing Failed → Retry → Published
```

---

# 11. Notification Lifecycle

```text
Draft → Queued → Sent → Delivered → Read
```

Failure:

```text
Queued → Failed → Retry → Sent
```

---

# 12. Bulk Upload Lifecycle

```text
Uploaded → Validated → Imported → Reviewed → Published
```

Validation failures return to **Uploaded**.

---

# 13. Candidate Attempt Lifecycle

```text
Created → Started → Paused → Resumed → Submitted → AI Evaluated → Reviewed → Results Published
```

Supports the Candidate Attempt Review Console including question-by-question review.

---

# 14. Guard Condition Registry

| Transition            | Guard Condition                |
| --------------------- | ------------------------------ |
| Approved → Published  | Mandatory metadata completed   |
| Submitted → Evaluated | Answers persisted successfully |
| Reviewed → Published  | Academic review complete       |
| Queued → Sent         | Valid recipients exist         |

---

# 15. Actor Permission Matrix

| Transition              | Role                   |
| ----------------------- | ---------------------- |
| Draft → Review          | Facilitator            |
| Review → Approved       | Academic Administrator |
| Approved → Published    | Academic Administrator |
| Reviewed → Published    | Academic Administrator |
| Retry Failed Evaluation | System Administrator   |

---

# 16. Rollback & Recovery Policy

| Transition                | Rollback            |
| ------------------------- | ------------------- |
| Draft ↔ Review            | Allowed             |
| Review ↔ Approved         | Administrative      |
| Published → Archived      | Allowed             |
| Archived → Published      | Administrative only |
| Failed Evaluation → Retry | Allowed             |

---

# 17. State History Requirements

Every transition records:

- Entity ID
- Previous State
- New State
- Actor
- Timestamp
- Correlation ID
- Reason

---

# 18. UI State Mapping

| Business State | Student View | Admin View   |
| -------------- | ------------ | ------------ |
| Draft          | Hidden       | Editable     |
| Review         | Hidden       | Review Queue |
| Published      | Visible      | Editable     |
| Archived       | Hidden       | Read-only    |

---

# 19. Domain Event Mapping

| Transition            | Event               |
| --------------------- | ------------------- |
| Approved → Published  | QuestionsPublished  |
| Started → Submitted   | AssessmentSubmitted |
| Submitted → Evaluated | EvaluationCompleted |
| Reviewed → Published  | ResultsPublished    |
| Queued → Sent         | NotificationSent    |

---

# 20. Performance Targets

| Metric             |  Target |
| ------------------ | ------: |
| Transition latency | <100 ms |
| Audit persistence  | <200 ms |
| Event publication  | <100 ms |

---

# 21. State Machine Testing

- Valid transition tests
- Invalid transition tests
- Guard condition tests
- Timeout tests
- Rollback tests
- Recovery tests
- Event publication tests

---

# 22. Visual Legend

```text
○ Initial State
● Terminal State
→ Valid Transition
⇢ Recovery Transition
✖ Invalid Transition
```

---

# 23. Cross-Domain Workflow

```text
Questions Published
        ↓
Assessment Available
        ↓
Candidate Attempt
        ↓
AI Evaluation
        ↓
Academic Review
        ↓
Results Published
        ↓
Progress Updated
        ↓
Notification Delivered
```

---

# 24. Governance

Changes to state machines require:

- Architecture approval
- Updated documentation
- Regression tests
- Version increment

---

# Release Baseline

| Component             | Version |
| --------------------- | ------- |
| State Machine Catalog | v2      |
| Transition Validation | Enabled |
| Audit Logging         | Enabled |
| Domain Events         | Enabled |
| State History         | Enabled |

---

# Success Criteria

Every business workflow follows a deterministic, validated and auditable lifecycle with explicit ownership, guard conditions, recovery policies, domain event integration and consistent implementation across backend services, APIs, user interfaces and administrative tools.
