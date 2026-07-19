# Phase 2 Sprint 2.5 Addendum

## Student Learning Journey & Enrollment Domain Enhancements

This addendum extends the Sprint 2.5 implementation baseline with
learner-centric capabilities that improve personalization, adaptive
learning, and academic monitoring without altering the overall domain
architecture.

---

# Enhancement 1 --- Learning Pace

## Objective

Support multiple study intensities for learners preparing for different
examination timelines.

Learning Pace determines how the Study Plan Engine distributes lessons,
resources, practice sessions, and milestones.

## Learning Pace Types

```text
Accelerated
Standard
Flexible
Intensive
Self-Paced
```

## Database

Add columns

```text
student_learning_profiles

learning_pace
estimated_completion_date
weekly_study_hours
```

## Domain

### Value Object

```text
LearningPace
```

### Entity Update

```text
StudentLearningProfile

+ learningPace
+ weeklyStudyHours
+ estimatedCompletionDate
```

## Dashboard Example

```text
Exam

IELTS Academic

Learning Stage

Intermediate

Learning Pace

Accelerated

Weekly Goal

18 Hours

Estimated Completion

4 Weeks
```

---

# Enhancement 2 --- Target Exam Date

## Objective

Allow every student's learning journey to be driven by their actual
examination date.

Instead of generic study plans, all scheduling becomes deadline-aware.

## Database

```text
student_enrollments

target_exam_date
target_score
exam_registration_status
```

## Domain

### Value Objects

```text
TargetExamDate

TargetScore
```

## Study Plan Engine

The engine should calculate:

```text
Remaining Days
Remaining Weeks
Lessons Per Week
Practice Frequency
Mock Schedule
Revision Window
```

## Dashboard

```text
Target Exam

18 October 2026

Days Remaining

95 Days

Target Band

7.5
```

---

# Enhancement 3 --- Exam Readiness Score

## Objective

Measure preparedness rather than simple curriculum completion.

Progress measures learning completion.

Readiness measures likelihood of examination success.

## Dashboard

```text
Curriculum Progress

78%

Exam Readiness

63%
```

## Readiness Inputs

```text
Diagnostic Performance
Practice Scores
Mock Scores
Curriculum Completion
Lesson Consistency
Learning Pace
Time Remaining
Weak Skill Areas
```

## Database

```text
student_progress

readiness_score
readiness_level
last_readiness_update
```

## Domain

### Value Object

```text
ReadinessScore
```

### Domain Service

```text
ReadinessCalculator
```

## Readiness Levels

```text
0–39  High Risk
40–59 Needs Improvement
60–79 Nearly Ready
80–100 Exam Ready
```

---

# Enhancement 4 --- Intervention Engine

## Objective

Automatically identify learners who require additional support and
trigger appropriate interventions.

## Position in Learning Flow

```text
Learning Progress

↓

Intervention Engine

↓

Recommendations

↓

Notifications

↓

Updated Study Plan
```

## Detection Rules

```text
No login for 7 days
Missed weekly targets
Repeated lesson failures
Low readiness score
Slow progress
Weak competency areas
Missed study sessions
Declining assessment scores
```

## Intervention Actions

```text
Notify Student
Notify Instructor
Recommend Review Lessons
Adjust Study Plan
Schedule Practice
Recommend Mock Examination
Escalate Academic Support
```

## Database

```text
student_interventions
intervention_rules
intervention_history
student_alerts
```

## Domain

### Entity

```text
LearningIntervention
```

### Aggregate

```text
StudentIntervention
```

### Domain Events

```text
StudentAtRisk
StudyPlanAdjusted
InstructorNotified
StudentReminderSent
ReadinessDropped
```

---

# Updated Student Dashboard

```text
┌────────────────────────────────────────────┐
│ IELTS Academic                             │
├────────────────────────────────────────────┤
│ Learning Stage                             │
│ Intermediate                               │
├────────────────────────────────────────────┤
│ Learning Pace                              │
│ Accelerated                                │
├────────────────────────────────────────────┤
│ Target Exam Date                           │
│ 18 October 2026                            │
├────────────────────────────────────────────┤
│ Days Remaining                             │
│ 95 Days                                    │
├────────────────────────────────────────────┤
│ Curriculum Progress                        │
│ 68%                                        │
├────────────────────────────────────────────┤
│ Exam Readiness                             │
│ 74%                                        │
├────────────────────────────────────────────┤
│ Weekly Goal                                │
│ 18 Hours                                   │
├────────────────────────────────────────────┤
│ Practice Status                            │
│ Eligible                                   │
├────────────────────────────────────────────┤
│ Mock Status                                │
│ Available                                  │
├────────────────────────────────────────────┤
│ Active Intervention                        │
│ Review Reading Module 4                    │
└────────────────────────────────────────────┘
```

---

# Updated Learning Flow

```text
Registration
↓
Diagnostic Assessment
↓
Placement
↓
Enrollment
↓
Learning Stage
↓
Learning Pace
↓
Target Exam Date
↓
Curriculum Assignment
↓
Resource Assignment
↓
Study Plan Generation
↓
Learning Progress
↓
Readiness Calculation
↓
Intervention Engine
↓
Practice Eligibility
↓
Mock Eligibility
```

---

# Future Academic Platform Architecture

```text
Platform
↓
Identity
↓
Authentication
↓
Academic Foundation
↓
Exam Products
↓
Curriculum
↓
Learning Resources
↓
Question Bank
↓
Diagnostic Assessment
↓
Student Learning Journey
↓
Practice Engine
↓
Mock Examination
↓
AI Evaluation
↓
Readiness Engine
↓
AI Coach
↓
Learning Analytics
↓
Academic Insights
```

---

# Sprint 2.5 Baseline Status

The following capabilities are now considered part of the implementation
baseline:

- Student Enrollment Engine
- Learning Journey Engine
- Learning Pace Management
- Target Exam Date Management
- Curriculum Assignment Engine
- Resource Assignment Engine
- Study Plan Engine
- Progress Tracking Engine
- Exam Readiness Engine
- Intervention Engine
- Practice Eligibility Engine
- Mock Eligibility Engine
- Student Dashboard
- Admin Dashboard
- REST APIs
- Automated Testing
- Architecture Metrics
- Release Tag `v1.5.0-student-learning-domain`
