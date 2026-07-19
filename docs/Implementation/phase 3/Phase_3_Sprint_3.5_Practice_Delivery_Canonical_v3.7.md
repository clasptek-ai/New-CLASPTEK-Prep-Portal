# Phase 3 Sprint 3.5 — Practice Delivery Domain

## Canonical Implementation Specification

# Document Status

- **Status:** Canonical
- **Owner:** Clasptek Engineering
- **Version:** 3.6.0
- **Next Review:** Sprint 3.6

---

# Vision

Deliver guided, repeatable practice sessions that reinforce learning after assessment. Practice exists to improve mastery before students attempt a Mock Examination.

---

# Objective

Implement the Practice Delivery Domain responsible for delivering administrator-approved practice sessions using questions from the Enterprise Question Bank.

Students cannot access practice until an administrator unlocks it after reviewing assessment results.

---

# Scope

## Included

- Practice Delivery
- Practice Sessions
- Question Rendering
- Practice Navigation
- Answer Capture
- Immediate Feedback
- Practice Results
- Progress Tracking
- Practice History
- Bookmark Questions
- Retry Incorrect Questions

## Excluded

- Question Authoring
- Assessment Delivery
- Mock Delivery
- AI Writing Evaluation
- AI Speaking Evaluation
- Learning Analytics

---

# Domain Responsibilities

## Owns

- Practice Sessions
- Practice Attempts
- Practice Results
- Practice Review
- Practice History

## Does Not Own

- Question Bank
- Assessment Delivery
- Mock Examination
- AI Evaluation

---

# Dependencies

## Consumes

- Authentication
- Authorization
- Student Portal
- Admin Portal
- Enterprise Question Bank
- Assessment Results
- Practice Unlock Event

## Produces

- Practice Results
- Practice Completion Event
- Mock Unlock Recommendation
- Audit Events

---

# Architecture

Platform Foundation
↓
Assessment Delivery
↓
Practice Delivery
↓
Mock Examination

---

# Practice Types

- Grammar Practice
- Reading Practice
- Listening Practice
- Writing Prompt Practice
- Speaking Prompt Practice
- Mixed Practice

---

---

# Practice Modes

Support configurable modes:

- Learning Mode
- Review Mode
- Timed Practice
- Untimed Practice
- Retry Incorrect Questions
- Custom Practice

---

# Practice Attempt Policy

Each practice supports configurable:

- Maximum Attempts
- Unlimited Attempts
- Time Limit
- Resume Allowed
- Immediate Feedback
- Show Explanations
- Retry Incorrect Questions
- Randomize Questions
- Randomize Options
- Bookmark Allowed

---

# Practice Session Lifecycle

Locked → Available → Started → In Progress → Submitted → Completed → Reviewed

---

# Practice Rules

- Admin must unlock practice.
- Students may see locked practice but cannot start it.
- Immediate feedback is configurable.
- Practice may be timed or untimed.
- Students may retry based on administrator policy.

---

# Database

## Migrations

- 00250_practice_sessions.sql
- 00251_practice_attempts.sql
- 00252_practice_answers.sql
- 00253_practice_results.sql
- 00254_practice_bookmarks.sql
- 00255_practice_rls.sql

## Tables

- practice_sessions
- practice_attempts
- practice_answers
- practice_results
- practice_bookmarks
- practice_review_queue
- practice_wrong_answer_queue
- practice_statistics
- practice_session_events

---

# Domain Package

packages/domain/practice-delivery

## Value Objects

- PracticeSessionId
- PracticeAttemptId
- PracticeStatus

## Entities

- PracticeSession
- PracticeAttempt
- PracticeResult

## Aggregate

- PracticeSession

## Repository Interfaces

- PracticeSessionRepository
- PracticeResultRepository
- PracticeBookmarkRepository
- PracticeStatisticsRepository

## Domain Events

- PracticeUnlocked
- PracticeStarted
- PracticeCompleted
- PracticeReviewed
- PracticeResumed
- PracticeExpired
- PracticeRetried
- MockRecommended

---

# Application Layer

packages/application/practice-delivery

## Commands

- StartPractice
- SaveAnswer
- SubmitPractice
- BookmarkQuestion
- RetryPractice

## Handlers

- StartPracticeHandler
- SubmitPracticeHandler
- RetryPracticeHandler
- BookmarkQuestionHandler

## Queries

- GetPractice
- GetPracticeHistory
- GetPracticeResults
- GetBookmarks

---

# Feedback Engine

Supports configurable feedback:

- Correct Answer
- Explanation
- Referenced Lesson
- Retry Recommendation

Administrators decide whether feedback is shown immediately or after submission.

---

# Student Dashboard

Display

- Available Practice
- Locked Practice
- Current Practice
- Practice History
- Current Streak
- Practice Completion %
- Wrong Answer Queue
- Review Queue
- Bookmarked Questions
- Results

# Admin Dashboard

Display

- Practice Availability
- Student Completion
- Average Score
- Weakest Skills
- Most Missed Questions
- Students Ready for Mock
- Unlock Controls
- Bulk Unlock Controls

---

# REST APIs

## Student APIs

- POST /api/v1/practice/start
- POST /api/v1/practice/answer
- POST /api/v1/practice/submit
- POST /api/v1/practice/resume
- POST /api/v1/practice/retry
- GET /api/v1/practice/current
- GET /api/v1/practice/history
- GET /api/v1/practice/results
- GET /api/v1/practice/review-queue

## Admin APIs

- POST /api/v1/admin/practice/unlock
- POST /api/v1/admin/practice/bulk-unlock
- POST /api/v1/admin/practice/reset
- GET /api/v1/admin/practice/statistics
- GET /api/v1/admin/practice/students
- GET /api/v1/admin/practice/attempts

---

## Student APIs

- POST /api/v1/practice/start
- POST /api/v1/practice/answer
- POST /api/v1/practice/submit
- GET /api/v1/practice/history
- GET /api/v1/practice/results

## Admin APIs

- POST /api/v1/admin/practice/unlock
- GET /api/v1/admin/practice/statistics
- GET /api/v1/admin/practice/students

---

# Security

- Practice Access Validation
- Audit Logging
- Session Validation
- Row Level Security

---

# Testing

- Domain Tests
- Application Tests
- API Tests
- Feedback Tests
- Progress Tests

Coverage

- Domain 100%
- Application 90%
- Persistence 85%

---

# Acceptance Criteria

- Practice remains locked until administrator approval.
- Practice sessions function correctly.
- Feedback follows configured policy.
- Students can review completed practice.
- Admin can unlock mock examinations.

---

# Practice Completion Record

Store

- Practice Name
- Completion Date
- Score
- Status

---

# Deliverables

- Practice Delivery Engine
- Feedback Engine
- Student Practice Dashboard
- Admin Practice Dashboard
- REST APIs
- Automated Tests

---

# Engineering Metrics

- Architecture Score
- REST Endpoints
- Database Tables
- Test Coverage
- Documentation Coverage

---

# Release

**Release Tag:** `v3.5.0-practice-delivery-canonical`

---

# Practice Result Engine

Produces:

- Overall Score
- Skill Scores
- Accuracy
- Time Taken
- Incorrect Questions
- Bookmark Summary
- Retry Recommendations

---

# Wrong Answer Queue

Every incorrect answer is automatically added to a personal Wrong Answer Queue.

Students may retry these questions until mastery is achieved.

---

# Review Queue

Students can mark questions as **Review Later**.

At the end of a session, all flagged questions are presented in a dedicated Review Queue.

---

# Practice Session Recovery

Browser Crash

↓

Resume Practice

↓

Restore Answers

↓

Continue Practice

↓

Submit

---

# Practice Recommendation Engine

Rule-based recommendations only.

Examples:

- Grammar < 60% → Recommend Grammar Practice Set
- Reading < 70% → Recommend Reading Practice Set
- Listening < 65% → Recommend Listening Practice Set

No AI is required for this engine.

---

# Student Dashboard

Display

- Available Practice
- Locked Practice
- Current Practice
- Practice History
- Current Streak
- Practice Completion %
- Wrong Answer Queue
- Review Queue
- Bookmarked Questions
- Results

# Admin Dashboard Enhancements

Add:

- Average Score
- Weakest Skills
- Most Missed Questions
- Students Ready for Mock
- Bulk Unlock Controls

---

# Additional Domain Events

- PracticeResumed
- PracticeExpired
- PracticeRetried

---

STATUS: READY FOR FREEZE

QUALITY: ENTERPRISE READY

ARCHITECTURE: STABLE

RELEASE TAG: `v3.6.0-practice-delivery-canonical`
