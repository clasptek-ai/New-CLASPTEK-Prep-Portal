# Phase 2 Sprint 2.7 --- Mock Examination Engine Domain Design

## Clasptek Prep Portal V2

### Overview

The Mock Examination Engine provides realistic examination-grade
simulations that evaluate whether a learner is prepared to sit the real
examination. It reproduces official timing, navigation, scoring, and
examination conditions while integrating with the Learning Journey,
Adaptive Practice, Curriculum, Question Bank, and Readiness domains.

---

# Architecture Overview

```text
Platform Kernel
      │
      ▼
Exam Product Domain
      │
      ▼
Curriculum Domain
      │
      ▼
Learning Resource Domain
      │
      ▼
Question Bank Domain
      │
      ▼
Diagnostic Assessment Domain
      │
      ▼
Student Learning Journey Domain
      │
      ▼
Adaptive Practice Domain
      │
      ▼
═══════════════════════════════════════════
      MOCK EXAMINATION ENGINE
═══════════════════════════════════════════
      │
      ├── Examination Rules Engine
      ├── Scoring Engine
      ├── Readiness Engine
      ├── Reporting Engine
      └── Historical Analytics
      │
      ▼
AI Evaluation Domain (Future)
```

---

# Student Examination Flow

```text
Student
    ↓
Learning Journey
    ↓
Practice Completion
    ↓
Mock Recommendation
    ↓
Mock Examination
    ↓
Section Execution
    ↓
Submission
    ↓
Scoring
    ↓
Readiness Update
    ↓
Recommendations
    ↓
AI Evaluation (Future)
```

---

# Core Components

## Examination Rules Engine

Supports:

```text
Timed Sections
Automatic Section Locking
Navigation Rules
Official Break Rules
Question Randomization
Question Order Rules
Auto Save
Auto Submit
Resume Rules
Exam Integrity Rules
```

---

## Scoring Engine

Supports:

```text
Objective Question Scoring
Weighted Section Scoring
IELTS Band Conversion
TOEFL Scaling
CELPIP Levels
SAT Score Scaling
Overall Score
Percentile
Predicted Official Score
Readiness Score
```

---

## Readiness Engine

Calculates:

```text
Overall Readiness
Skill Readiness
Time Management Score
Consistency Score
Accuracy Score
Completion Score
Probability of Passing
Recommended Study Duration
```

---

## Reporting Engine

Produces:

```text
Student Report
Instructor Report
Section Analysis
Skill Analysis
Historical Comparison
Weak Areas
Strong Areas
Recommendations
Updated Study Plan
```

---

# Database Design

```text
mock_templates
        │
        ▼
mock_template_sections
        │
        ▼
mock_sessions
        │
        ▼
mock_attempts
        │
        ▼
mock_attempt_answers
        │
        ▼
mock_section_scores
        │
        ▼
mock_results
        │
        ├──────────────┐
        ▼              ▼
mock_reports     mock_readiness
        │              │
        └──────┬───────┘
               ▼
mock_statistics
```

---

# Student Dashboard

```text
Available Mock Exams
Scheduled Mock Exams
Exam Countdown
Current Attempts
Completed Attempts
Historical Results
Readiness Trend
Section Breakdown
Weak Skills
Predicted Official Score
Recommended Practice
```

---

# Instructor Dashboard

```text
Mock Builder
Template Management
Session Monitoring
Live Attempts
Student Progress
Review Queue
Reports
Performance Trends
Question Analytics
```

---

# REST APIs

```text
POST /api/v1/mock/start
POST /api/v1/mock/answer
POST /api/v1/mock/complete-section
POST /api/v1/mock/submit

GET  /api/v1/mock/history
GET  /api/v1/mock/results/{attemptId}
GET  /api/v1/mock/readiness
GET  /api/v1/mock/templates
```

---

# Examination Integrity

```text
Automatic Save
Network Recovery
Session Recovery
Browser Refresh Protection
Duplicate Session Detection
Time Synchronization
Question Locking
Submission Validation
Audit Events
```

---

# Domain Events

```text
MockStarted
SectionCompleted
MockSubmitted
MockScored
ReadinessCalculated
MockPassed
MockFailed
```

---

# Testing Strategy

```text
Domain Tests
Application Tests
Persistence Tests
API Tests
Timing Tests
Scoring Tests
Navigation Tests
Readiness Tests
```

Coverage Targets

```text
100% Domain
90% Application
85% Persistence
```

---

# Verification Checklist

```text
✓ Student starts mock examination
✓ Timers operate correctly
✓ Section locking works
✓ Auto-save functions
✓ Auto-submit executes correctly
✓ Scores calculate correctly
✓ Readiness updates
✓ Reports generate successfully
✓ Historical trends update
✓ Architecture Score remains 100%
```

---

# Deliverables

- Mock Examination Engine
- Examination Rules Engine
- Scoring Engine
- Readiness Engine
- Reporting Engine
- Student Dashboard
- Instructor Dashboard
- REST APIs
- Automated Tests
- Updated Architecture Metrics
- Release Tag `v1.7.0-mock-examination-engine`
