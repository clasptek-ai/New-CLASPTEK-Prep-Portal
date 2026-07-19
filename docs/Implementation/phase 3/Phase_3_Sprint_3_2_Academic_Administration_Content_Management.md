# Phase 3 Sprint 3.2 --- Academic Administration & Content Management Portal

## Clasptek Prep Portal V2

# Objective

Implement the Academic Administration & Content Management Portal as the
operational and academic control center for Clasptek Prep Portal V2.

Administrators own the complete academic content lifecycle: - Create -
Import - Review - Publish - Assign - Unlock - Monitor

Students only consume content and submit responses.

---

# Scope

## Included

- Dashboard
- Student Management
- Grammar Management
- Reading Management
- Writing Management
- Listening Management
- Speaking Management
- SAT Mathematics Management
- Question Bank
- Learning Resources
- Assessment Builder
- Practice Builder
- Mock Examination Builder
- Results
- Reports
- Notifications
- Settings

## Excluded

- Coaching
- Live classes
- Messaging
- LMS features

---

# Admin Navigation

```text
Dashboard

Students

Academic Content
    ├── Grammar
    ├── Reading
    ├── Writing
    ├── Listening
    ├── Speaking
    ├── SAT Mathematics
    ├── Question Bank
    └── Learning Resources

Assessments
Practice
Mock Examinations
Results
Reports
Settings
```

---

# Dashboard

Display KPI cards:

- Total Students
- Assessments Completed
- Practice Active
- Mock Attempts
- Average Assessment Score
- Average Mock Score
- Pending AI Evaluations

Quick Actions:

- Create Assessment
- Create Practice
- Create Mock
- Import Questions
- Upload Resources
- Unlock Practice
- Unlock Mock

---

# Academic Content Management

## Grammar

Create, edit, publish and import grammar questions.

Each record contains:

- Question
- Options
- Correct Answer
- Explanation
- Skill
- Difficulty
- Exam Product
- Tags
- Marks
- Estimated Time

---

## Reading

Manage:

- Reading Passages
- Questions
- Correct Answers
- Explanations
- Images
- Charts
- Diagrams

One passage may contain many questions.

---

## Listening

Manage:

- Audio
- Transcript
- Questions
- Answers
- Explanations

Supported formats:

- MP3
- WAV

---

## Writing

Create:

- Writing Task
- Instructions
- Rubric
- Band Descriptors
- Sample Answer
- AI Prompt

---

## Speaking

Create:

- Speaking Prompt
- Cue Card
- Rubric
- Sample Response
- AI Evaluation Prompt

---

## SAT Mathematics

Manage:

- Question
- Diagram
- Formula
- Options
- Correct Answer
- Worked Solution
- Difficulty

---

# Enterprise Question Bank

Single source of truth.

Stores:

- Questions
- Correct Answers
- Explanations
- Rubrics
- Media
- Metadata
- Skills
- Tags
- Difficulty

Assessment, Practice and Mock reference this repository.

---

# Bulk Import

Supported:

- Excel (.xlsx)
- CSV
- JSON

Import includes:

- Questions
- Answers
- Explanations
- Skills
- Difficulty
- Marks
- Media References

Generate validation and import reports.

---

# Learning Resources

Upload:

- PDF
- Word
- PowerPoint
- Audio
- Video
- ZIP

Assign by:

- Programme
- Exam Product
- Student

---

# Assessment Builder

Workflow:

Create Assessment

→ Select Exam

→ Select Questions

→ Preview

→ Publish

Admin can view:

- Questions
- Correct Answers
- Explanations
- Student Results

---

# Practice Builder

Workflow:

Create Practice Set

→ Select Questions

→ Publish

→ Unlock

Admin views:

- Question
- Student Answer
- Correct Answer
- Explanation
- Performance

---

# Mock Examination Builder

Workflow:

Create Mock

→ Official Structure

→ Allocate Questions

→ Preview

→ Publish

→ Unlock

Admin views:

- Questions
- Correct Answers
- Scoring Rules
- Reports

---

# Student Management

Actions:

- View Student
- Reset Assessment
- Unlock Practice
- Lock Practice
- Unlock Mock
- Lock Mock
- Assign Resources
- View Results

---

# Reports

Generate:

- Assessment Reports
- Practice Reports
- Mock Reports
- Student Progress
- Programme Reports

Export:

- PDF
- Excel

---

# Settings

Manage:

- Exam Products
- Time Limits
- Attempt Limits
- Pass Marks
- Roles
- Permissions
- Email Templates

---

# Security

- RBAC
- Audit Logging
- Row Level Security
- Soft Deletes
- Version History

---

# REST APIs

```text
GET    /admin/dashboard
GET    /admin/students
POST   /admin/questions
POST   /admin/questions/import
POST   /admin/resources
POST   /admin/assessments
POST   /admin/practice
POST   /admin/mock
POST   /admin/practice/unlock
POST   /admin/mock/unlock
GET    /admin/results
GET    /admin/reports
PATCH  /admin/settings
```

---

# Testing

- Component Tests
- API Tests
- Integration Tests
- RBAC Tests
- Bulk Import Tests

Coverage:

- 100% Critical Components
- 90% Overall

---

# Acceptance Criteria

- Grammar management complete
- Reading management complete
- Writing management complete
- Listening management complete
- Speaking management complete
- SAT Mathematics management complete
- Question Bank is the single source of truth
- Bulk imports operational
- Assessment Builder operational
- Practice Builder operational
- Mock Builder operational
- Admin can view all Assessment questions, answers and explanations
- Admin can view all Mock questions, answers and explanations
- Admin can review Practice attempts with student answer, correct
  answer and explanation
- Unlock workflows operational
- All pages built with the Clasptek Design System

---

# Release

`v3.2.0-academic-administration-content-management`
