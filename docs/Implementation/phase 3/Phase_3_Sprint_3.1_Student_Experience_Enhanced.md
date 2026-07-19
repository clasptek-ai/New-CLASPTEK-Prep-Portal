# Phase 3 Sprint 3.1 --- Student Experience Specification v1.0 (Enhanced)

## Vision

A simple, exam-focused platform: Register → Diagnostic → Immediate
Results → Admin Unlock Practice → Practice → Admin Unlock Mock → Mock →
Final Results.

No live coach. No unnecessary complexity.

# Standard Page Specification

Every page MUST include:

1.  Purpose
2.  User Stories
3.  Entry Conditions
4.  Exit Conditions
5.  Wireframe/Layout
6.  Component Hierarchy
7.  API Calls
8.  Permissions
9.  Validation Rules
10. Loading State
11. Empty State
12. Error State
13. Success State
14. Responsive Behaviour
15. Accessibility
16. Performance
17. Acceptance Criteria

# Examination Player Specification

## Timer

- Countdown
- Warning at 10 and 5 minutes
- Auto-submit at zero

## Auto-save

- Every 30 seconds
- On navigation
- On browser refresh attempt

## Keyboard Shortcuts

- Next: Alt+Right
- Previous: Alt+Left
- Flag: Alt+F

## Navigation

- Jump to question
- Flagged list
- Answered/Unanswered indicators

## Review Screen

- Answer summary
- Flagged questions
- Unanswered warning
- Final confirmation

## Submission

- Confirmation dialog
- Auto-submit on timeout
- Immediate scoring for Diagnostic and Practice

## Network Recovery

- Detect offline
- Queue local answers
- Sync when online

## Section Transitions

- Lock completed sections where exam rules require
- Preserve timer

# State Machines

## Practice

Locked → Unlocked → Started → In Progress → Submitted → Reviewed →
Completed

## Mock

Locked → Unlocked → Started → In Progress → Submitted → Results
Published

# Business Rules

- Diagnostic is mandatory.
- Students cannot bypass Diagnostic.
- Diagnostic score shown immediately.
- Practice is visible but locked until Admin approval.
- Mock is visible but locked until Admin approval.
- Mock reproduces official exam timing and navigation.
- Student cannot modify submitted attempts.
- Admin can review student answers and progress.

# Student Dashboard Widgets

- Current Exam
- Diagnostic Score
- Practice Status
- Mock Status
- Progress
- Notifications
- Recommended Next Action
