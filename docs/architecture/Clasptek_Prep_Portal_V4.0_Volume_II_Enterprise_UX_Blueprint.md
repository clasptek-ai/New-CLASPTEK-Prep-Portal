# Clasptek Prep Portal V4.0 Enterprise Blueprint

# Volume II --- Enterprise UX Blueprint

**Version:** 4.0 (Foundational Edition)

> This volume defines the complete user experience architecture for the
> Clasptek Prep Portal. It specifies user journeys, navigation,
> workflows, interaction principles, screen inventory, states,
> notifications, accessibility, and UX governance.

---

# Table of Contents

1.  UX Vision
2.  Experience Principles
3.  Information Architecture
4.  Navigation Architecture
5.  User Personas & Goals
6.  Student Journey
7.  Administrator Journey
8.  Screen Inventory
9.  Dashboard Specifications
10. Assessment Experience
11. Practice Experience
12. Mock Examination Experience
13. Notification Architecture
14. State Models
15. Accessibility
16. Error & Empty States
17. UX Acceptance Standards
18. Handoff to Frontend

---

# 1. UX Vision

Create a calm, trustworthy, examination-focused experience that
minimizes cognitive load while maximizing learner confidence and
administrator efficiency.

---

# 2. Experience Principles

- Programme determines experience.
- One task per screen.
- Progressive disclosure.
- Consistent navigation.
- Accessibility by default.
- Mobile-first responsiveness.
- Professional examination fidelity.

---

# 3. Information Architecture

## Admin Workspace

Dashboard → Students → Programmes → Assessment Centre → Practice Centre
→ Mock Centre → Results → Analytics → Content Studio → Question Bank →
AI Review → Users & Roles → Audit Logs → Settings

## Student Portal

Dashboard → Assessment → Learning → Practice → Mock Tests → Results →
Resources → Profile

---

# 4. Navigation Architecture

## Global Rules

- Dashboard is programme-specific.
- No cross-programme navigation.
- Breadcrumbs outside examination mode.
- Examination mode hides global navigation.

---

# 5. User Personas

## Student

Primary goals: - Complete assessments. - Improve through practice. -
Become exam-ready.

## Academic Administrator

Primary goals: - Monitor progress. - Manage programmes. - Review AI
output.

## Content Author

Primary goals: - Build and publish high-quality assessments.

---

# 6. Student Journey

Registration → Programme Allocation → Welcome → Diagnostic Assessment →
Results → Learning Plan → Practice Sessions → Mock Examination →
Readiness Dashboard → Programme Completion

Each transition must validate permissions, save progress, and update
analytics.

---

# 7. Administrator Journey

Login → Dashboard → Student Monitoring → Assessment Review → AI Review →
Programme Analytics → Reporting → Communication → Audit

---

# 8. Screen Inventory (Foundation)

## Admin

- Dashboard
- Student List
- Student Profile
- Programme Dashboard
- Programme Editor
- Assessment Builder
- Question Editor
- Passage Editor
- AI Review Queue
- Reports
- Audit Logs
- Settings

## Student

- Dashboard
- Assessment Landing
- Assessment Instructions
- Reading
- Listening
- Writing
- Speaking
- Practice Hub
- Mock Hub
- Results
- Resources
- Profile

> Future revisions will expand this inventory to every page, modal and
> dialog.

---

# 9. Dashboard Specifications

Student Dashboard widgets: - Current Programme - Assessment Status -
Next Recommended Action - Practice Progress - Mock Eligibility - Recent
Performance - Notifications

Admin Dashboard widgets: - New Registrations - Assessment Queue - AI
Queue - Active Students - Programme Health - Operational KPIs

---

# 10. Assessment Experience

Rules: - Timed (mandatory) - Strict navigation - Auto-save - Server
timer - Session recovery - Auto submission - No learning resources
during assessment - Immediate objective scoring - AI evaluation where
applicable

---

# 11. Practice Experience

Rules: - Flexible navigation - Retry enabled - Explanations available -
Optional timer - Progress tracking

---

# 12. Mock Examination Experience

Rules: - Mirrors official examination conditions - Timed - Strict
navigation - Final submission - Readiness reporting

---

# 13. Notification Architecture

Student: - Registration - Assessment available - Practice unlocked -
Mock available - Results published

Admin: - AI review required - Assessment completed - Publishing
workflow - System alerts

---

# 14. State Models

Student: Registered → Assessment Pending → Training Active → Practice
Active → Mock Eligible → Programme Completed

Assessment: Available → In Progress → Submitted → AI Processing →
Completed

Question: Draft → Review → Approved → Published → Retired

---

# 15. Accessibility

- WCAG-aligned design target
- Keyboard navigation
- Screen reader support
- High contrast compatibility
- Captions/transcripts where needed

---

# 16. Error, Loading & Empty States

Every screen must define: - Loading state - Empty state - Validation
state - Permission denied state - Network recovery state - Success state

---

# 17. UX Acceptance Standards

Each screen shall document: - Purpose - Entry conditions - Exit
conditions - Navigation - Components - Business rules - Analytics
events - Acceptance criteria

---

# 18. Handoff

This volume feeds directly into: - Volume III --- Examination Engine
Specification - Volume IV --- Frontend Screen Specifications
