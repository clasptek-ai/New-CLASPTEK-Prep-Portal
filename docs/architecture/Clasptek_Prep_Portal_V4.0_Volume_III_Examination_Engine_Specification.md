# Clasptek Prep Portal V4.0 Enterprise Blueprint

# Volume III --- Examination Engine Specification

**Version:** 4.0 (Foundational Edition)

> This volume defines the architecture, workflows, integrity controls
> and operational behaviour of the unified examination engine used for
> Diagnostic Assessments, Practice Sessions and Mock Examinations.

---

# Contents

1.  Examination Philosophy
2.  Unified Examination Engine
3.  Engine Architecture
4.  Examination Modes
5.  Timer Engine
6.  Navigation Engine
7.  Question Delivery Engine
8.  Auto-save & Recovery
9.  Submission Engine
10. AI Evaluation Pipeline
11. Results Engine
12. Integrity & Security
13. Analytics Events
14. State Machines
15. Programme-specific Rules
16. Acceptance Criteria

---

# 1. Examination Philosophy

Every examination experience must emulate the professionalism,
reliability and predictability expected of international computer-based
examinations while remaining configurable for different programmes.

Core principles:

- One shared engine
- Configuration over duplication
- Programme-specific behaviour
- Server-authoritative timing
- Immutable attempts
- Complete audit trail

---

# 2. Unified Examination Engine

The same engine powers:

- Diagnostic Assessment
- Guided Practice
- Mock Examination

Configuration determines behaviour instead of separate implementations.

---

# 3. Engine Architecture

Core services:

- Session Manager
- Timer Service
- Navigation Service
- Question Delivery
- Auto-save Service
- Submission Service
- AI Evaluation Queue
- Results Service
- Analytics Service
- Audit Logger

---

# 4. Examination Modes

## Diagnostic Assessment

- Timed
- Strict navigation
- Immediate objective scoring
- AI evaluation
- Training unlock on completion

## Practice

- Optional timer
- Retry permitted
- Explanations enabled
- Progress tracking

## Mock Examination

- Timed
- Strict navigation
- Official simulation
- Final report after submission

---

# 5. Timer Engine

Requirements

- Server-controlled timer
- Resume after reconnect
- Five-minute warning
- One-minute warning
- Automatic submission at expiry

State Flow

Ready → Running → Warning → Expired → Submitted

---

# 6. Navigation Engine

Rules

- Programme configurable
- Sequential progression
- Flag for review (where supported)
- Completed sections lock permanently
- Global navigation disabled during examinations

---

# 7. Question Delivery Engine

Supports:

- Reading passages
- Listening audio
- Writing prompts
- Speaking prompts
- Multiple choice
- Matching
- Fill-in-the-gap
- Essay
- Audio responses

---

# 8. Auto-save & Recovery

- Save after every interaction
- Recovery after browser refresh
- Resume interrupted sessions
- Detect concurrent sessions
- Preserve elapsed time

---

# 9. Submission Engine

Submission triggers:

- Manual completion
- Section completion
- Timer expiry
- Administrator intervention

Post-submission:

- Lock attempt
- Generate audit record
- Queue AI evaluation
- Publish results according to programme policy

---

# 10. AI Evaluation Pipeline

Writing

Submission → Queue → AI Evaluation → Confidence Score → Human Review
(optional) → Publish

Speaking follows the same lifecycle.

---

# 11. Results Engine

Produces:

- Raw scores
- Band scores
- Readiness indicators
- Skill breakdown
- AI feedback
- Historical comparisons

---

# 12. Integrity & Security

- One active examination session
- Immutable submissions
- Server-authoritative timestamps
- Full audit logging
- Permission validation
- Secure API communication

---

# 13. Analytics Events

Track:

- Examination started
- Question viewed
- Answer changed
- Flag toggled
- Auto-save
- Submission
- Timeout
- Recovery
- AI completed

---

# 14. State Machines

Session

Created → Ready → Active → Paused (Practice only) → Submitted → Closed

Attempt

Draft → Active → Submitted → Evaluated → Archived

---

# 15. Programme-specific Rules

Each programme defines:

- Time limits
- Section order
- Navigation policy
- AI workflow
- Scoring model
- Reporting model

Supported programmes:

- IELTS
- TOEFL
- SAT
- CELPIP
- English Proficiency

---

# 16. Acceptance Criteria

Every examination feature must include:

- Functional requirements
- Business rules
- Error handling
- Accessibility
- Security
- Performance targets
- QA scenarios
- API interactions
- Audit requirements

> Future editions will expand this volume into a detailed implementation
> specification covering each engine component, API contract, failure
> mode and programme-specific workflow.
